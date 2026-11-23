import { list, get, put, del } from "@vercel/blob";

// API de GETUMA Coach : stockage des groupes, gymnastes, séances et réglages
// dans un Blob store PRIVÉ (un fichier JSON par document : db/{collection}/{id}.json).
// Accès protégé par le code club (variable CLUB_CODE), envoyé dans l'en-tête x-club-code.

export const dynamic = "force-dynamic";

const COLS = new Set(["groups", "gymnasts", "sessions", "club"]);
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const blobPath = (col: string, id: string) => `db/${col}/${id}.json`;
type Doc = Record<string, unknown>;
type Op = { op: "set" | "patch" | "del"; col: string; id: string; data?: Doc; qid?: string };

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function deepMerge(a: Doc | undefined, b: Doc): Doc {
  const o: Doc = { ...(a || {}) };
  for (const k of Object.keys(b)) {
    const v = b[k];
    const cur = o[k];
    o[k] =
      v && typeof v === "object" && !Array.isArray(v) && cur && typeof cur === "object" && !Array.isArray(cur)
        ? deepMerge(cur as Doc, v as Doc)
        : v;
  }
  return o;
}

async function readDoc(p: string): Promise<{ data: Doc; etag: string } | null> {
  const r = await get(p, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  const txt = await new Response(r.stream).text();
  return { data: JSON.parse(txt) as Doc, etag: r.blob.etag };
}

async function writeDoc(p: string, data: Doc, etag?: string) {
  return put(p, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function readAll() {
  const out: Record<string, Record<string, Doc>> = { groups: {}, gymnasts: {}, sessions: {}, club: {} };
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix: "db/", cursor, limit: 1000 });
    r.blobs.forEach((b) => paths.push(b.pathname));
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  await Promise.all(
    paths.map(async (p) => {
      const m = p.match(/^db\/([a-z]+)\/(.+)\.json$/);
      if (!m || !COLS.has(m[1])) return;
      try {
        const d = await readDoc(p);
        if (d) out[m[1]][m[2]] = d.data;
      } catch (e) {
        console.error("read", p, e);
      }
    }),
  );
  return { out, count: paths.length };
}

async function applyOp(op: Op) {
  if (!COLS.has(op.col) || !ID.test(String(op.id))) throw new HttpError(400, "bad path");
  const p = blobPath(op.col, op.id);
  if (op.op === "del") {
    await del(p).catch(() => {});
    return;
  }
  if (!op.data || typeof op.data !== "object" || Array.isArray(op.data)) throw new HttpError(400, "bad data");
  if (JSON.stringify(op.data).length > 200_000) throw new HttpError(413, "too large");
  if (op.op === "set") {
    await writeDoc(p, op.data);
    return;
  }
  if (op.op === "patch") {
    // Lecture, fusion, écriture conditionnelle (ifMatch) : deux coachs qui modifient le même gymnaste ne s'écrasent pas.
    for (let i = 0; i < 4; i++) {
      const cur = await readDoc(p);
      try {
        await writeDoc(p, deepMerge(cur?.data, op.data), cur?.etag);
        return;
      } catch (e) {
        const err = e as Error;
        if (err.name !== "BlobPreconditionFailedError" && !/precondition/i.test(err.message || "")) throw e;
      }
    }
    throw new HttpError(409, "conflict");
  }
  throw new HttpError(400, "bad op");
}

function authorized(req: Request) {
  const code = process.env.CLUB_CODE;
  return !!code && req.headers.get("x-club-code") === code;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  if (!authorized(req)) return json({ error: "code" }, 401);
  try {
    const { out, count } = await readAll();
    if (count === 0) {
      const group = { name: "Société", apps: ["sol"] };
      const club = { coaches: ["Hippolyte"] };
      await writeDoc(blobPath("groups", "societe"), group);
      await writeDoc(blobPath("club", "settings"), club);
      return json({ groups: { societe: group }, gymnasts: {}, sessions: {}, club: { settings: club } });
    }
    return json(out);
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) return json({ error: "code" }, 401);
  try {
    const body = (await req.json().catch(() => ({}))) as { ops?: Op[] };
    const ops = Array.isArray(body.ops) ? body.ops.slice(0, 100) : [];
    const done: (string | null)[] = [];
    for (const op of ops) {
      await applyOp(op);
      done.push(op.qid ?? null);
    }
    return json({ ok: true, done });
  } catch (e) {
    console.error(e);
    const status = e instanceof HttpError ? e.status : 500;
    return json({ error: (e as Error).message || "server" }, status);
  }
}
