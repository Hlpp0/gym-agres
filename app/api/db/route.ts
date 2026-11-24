import { deepMerge, deleteDoc, json, listPaths, readDoc, updateDoc, writeDoc, type Doc } from "@/lib/blobdb";
import { csrfOk, getUser, publicUser, type User } from "@/lib/auth";

// API de GETUMA Coach : sociétés, groupes, gymnastes, séances, présences.
// Stockage : Blob privé, un JSON par document : db/{collection}/{id}.json.
// Droits : l'admin voit et modifie tout. Un coach voit les sociétés de son compte (user.clubs)
// et peut modifier les gymnastes, séances et présences de leurs groupes. Sociétés et groupes : admin seulement.
// Un gymnaste peut appartenir à plusieurs groupes, y compris de sociétés différentes (champ groupIds).
// Un coach ne voit que les groupes de ses sociétés dans groupIds ; les autres sont conservés côté serveur.

export const dynamic = "force-dynamic";

const COLS = ["clubs", "groups", "gymnasts", "sessions", "attendance"] as const;
type Col = (typeof COLS)[number];
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const docPath = (col: string, id: string) => `db/${col}/${id}.json`;
type Op = { op: "set" | "patch" | "del"; col: Col; id: string; data?: Doc; qid?: string };
type All = Record<Col, Record<string, Doc>>;

/** Groupes d'un gymnaste (ancien format : groupId unique). */
function gymGroups(d: Doc | undefined): string[] {
  if (!d) return [];
  if (Array.isArray(d.groupIds)) return (d.groupIds as unknown[]).map(String);
  return d.groupId ? [String(d.groupId)] : [];
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readAll(): Promise<All> {
  const out: All = { clubs: {}, groups: {}, gymnasts: {}, sessions: {}, attendance: {} };
  const paths = await listPaths("db/");
  await Promise.all(
    paths.map(async (p) => {
      const m = p.match(/^db\/([a-z]+)\/(.+)\.json$/);
      if (!m || !(COLS as readonly string[]).includes(m[1])) return;
      try {
        const d = await readDoc(p);
        if (d) out[m[1] as Col][m[2]] = d.data;
      } catch (e) {
        console.error("read", p, e);
      }
    }),
  );
  return out;
}

/** Première ouverture par l'admin : rattache les groupes sans société à une société par défaut. */
async function migrate(all: All) {
  const orphans = Object.entries(all.groups).filter(([, g]) => !g.clubId);
  if (!orphans.length) return;
  let clubId = Object.keys(all.clubs)[0];
  if (!clubId) {
    clubId = "societe";
    all.clubs[clubId] = { name: "Ma société" };
    await writeDoc(docPath("clubs", clubId), all.clubs[clubId]);
  }
  for (const [id, g] of orphans) {
    all.groups[id] = { ...g, clubId };
    await writeDoc(docPath("groups", id), all.groups[id]);
  }
}

function scope(all: All, u: User) {
  const isAdmin = u.role === "admin";
  const clubIds = new Set(isAdmin ? Object.keys(all.clubs) : (u.clubs || []).filter((c) => all.clubs[c]));
  const groupIds = new Set(Object.entries(all.groups).filter(([, g]) => clubIds.has(String(g.clubId))).map(([id]) => id));
  return { isAdmin, clubIds, groupIds };
}

async function members(clubIds: Set<string>) {
  const out: Record<string, { uid: string; name: string; bdns: string }[]> = {};
  const paths = await listPaths("users/");
  const users = await Promise.all(paths.map(async (p) => (await readDoc(p))?.data as unknown as User | undefined));
  for (const u of users) {
    if (!u || u.status !== "active") continue;
    const cl = u.role === "admin" ? [...clubIds] : (u.clubs || []).filter((c) => clubIds.has(c));
    for (const c of cl) (out[c] = out[c] || []).push({ uid: u.uid, name: u.name, bdns: u.bdns || "" });
  }
  for (const c of Object.keys(out)) out[c].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return out;
}

export async function GET(req: Request) {
  try {
    const u = await getUser(req);
    if (!u) return json({ error: "auth" }, 401);
    const all = await readAll();
    if (u.role === "admin") await migrate(all);
    const { clubIds, groupIds } = scope(all, u);
    const pick = (col: Col, keep: (id: string, d: Doc) => boolean) =>
      Object.fromEntries(Object.entries(all[col]).filter(([id, d]) => keep(id, d)));
    return json({
      me: publicUser(u),
      clubs: pick("clubs", (id) => clubIds.has(id)),
      groups: pick("groups", (id) => groupIds.has(id)),
      gymnasts: Object.fromEntries(
        Object.entries(all.gymnasts)
          .filter(([, d]) => gymGroups(d).some((g) => groupIds.has(g)))
          .map(([id, d]) => [id, { ...d, groupIds: gymGroups(d).filter((g) => groupIds.has(g)) }]),
      ),
      sessions: pick("sessions", (_, d) => groupIds.has(String(d.groupId))),
      attendance: pick("attendance", (_, d) => groupIds.has(String(d.groupId))),
      members: await members(clubIds),
    });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}

async function applyOp(op: Op, u: User, all: All) {
  if (!(COLS as readonly string[]).includes(op.col) || !ID.test(String(op.id))) throw new HttpError(400, "bad path");
  const { isAdmin, groupIds } = scope(all, u);
  const p = docPath(op.col, op.id);
  if ((op.col === "clubs" || op.col === "groups") && !isAdmin) throw new HttpError(403, "admin only");
  if (op.col === "groups" && op.op !== "del" && op.data && "clubId" in op.data && !all.clubs[String(op.data.clubId)]) {
    throw new HttpError(400, "unknown club");
  }
  if (op.col === "gymnasts") {
    const cur = all.gymnasts[op.id];
    const curGroups = gymGroups(cur);
    if (cur && !isAdmin && !curGroups.some((g) => groupIds.has(g))) throw new HttpError(403, "forbidden");
    const hidden = isAdmin ? [] : curGroups.filter((g) => !groupIds.has(g)); // groupes d'autres sociétés, conservés
    if (op.op === "del") {
      if (hidden.length) {
        // Le gymnaste existe aussi ailleurs : on le retire seulement des groupes visibles.
        const next = await updateDoc(p, (d) => (d ? { ...d, groupIds: hidden, groupId: hidden[0] } : null));
        if (next) all.gymnasts[op.id] = next;
        return;
      }
    } else if (op.data) {
      if ("groupIds" in op.data || "groupId" in op.data || !cur) {
        const asked = Array.isArray(op.data.groupIds) ? (op.data.groupIds as unknown[]).map(String) : op.data.groupId ? [String(op.data.groupId)] : curGroups;
        const allowed = asked.filter((g) => (isAdmin ? !!all.groups[g] : groupIds.has(g)));
        const merged = [...new Set([...hidden, ...allowed])];
        if (!merged.length || (!isAdmin && !allowed.length && !cur)) throw new HttpError(403, "forbidden");
        if (!merged.length) throw new HttpError(400, "no group");
        op.data = { ...op.data, groupIds: merged, groupId: merged[0] };
      }
    }
  }
  if (op.col === "sessions" || op.col === "attendance") {
    // Le document existant ET la nouvelle version doivent rester dans un groupe autorisé.
    const cur = all[op.col][op.id];
    if (cur && !groupIds.has(String(cur.groupId))) throw new HttpError(403, "forbidden");
    if (op.op !== "del") {
      const target = op.data && "groupId" in op.data ? String(op.data.groupId) : cur ? String(cur.groupId) : "";
      if (!groupIds.has(target)) throw new HttpError(403, "forbidden");
    }
  }
  if (op.op === "del") {
    await deleteDoc(p);
    delete all[op.col][op.id];
    return;
  }
  if (!op.data || typeof op.data !== "object" || Array.isArray(op.data)) throw new HttpError(400, "bad data");
  if (JSON.stringify(op.data).length > 200_000) throw new HttpError(413, "too large");
  if (op.op === "set") {
    await writeDoc(p, op.data);
    all[op.col][op.id] = op.data;
    return;
  }
  if (op.op === "patch") {
    const next = await updateDoc(p, (cur) => deepMerge(cur || undefined, op.data as Doc));
    if (next) all[op.col][op.id] = next;
    return;
  }
  throw new HttpError(400, "bad op");
}

export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  try {
    const u = await getUser(req);
    if (!u) return json({ error: "auth" }, 401);
    const body = (await req.json().catch(() => ({}))) as { ops?: Op[] };
    const ops = Array.isArray(body.ops) ? body.ops.slice(0, 100) : [];
    const all = await readAll();
    const done: (string | null)[] = [];
    const rejected: { qid: string | null; error: string }[] = [];
    for (const op of ops) {
      try {
        await applyOp(op, u, all);
        done.push(op.qid ?? null);
      } catch (e) {
        if (e instanceof HttpError && e.status < 500) {
          // Opération refusée (droits, données invalides) : on la retire de la file pour ne pas bloquer les suivantes.
          rejected.push({ qid: op.qid ?? null, error: e.message });
          done.push(op.qid ?? null);
        } else throw e;
      }
    }
    return json({ ok: true, done, rejected });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
