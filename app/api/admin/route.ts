import { deleteDoc, json, listPaths, readDoc, touchRev } from "@/lib/blobdb";
import { csrfOk, emailPath, forgetUser, usersChanged, getUser, hashPassword, patchUser, publicUser, tempPassword, userPath, type User } from "@/lib/auth";

// Administration : réservée au rôle admin. Liste des comptes, validation, rôles, sociétés, mots de passe.
export const dynamic = "force-dynamic";

const UID = /^[a-z0-9]{8,40}$/;
const ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function GET(req: Request) {
  const me = await getUser(req);
  if (!me) return json({ error: "auth" }, 401);
  if (me.role !== "admin") return json({ error: "forbidden" }, 403);
  const paths = await listPaths("users/");
  const users = (
    await Promise.all(paths.map(async (p) => (await readDoc(p))?.data as unknown as User | undefined))
  ).filter(Boolean).map((u) => publicUser(u as User));
  users.sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1) || a.name.localeCompare(b.name, "fr"));
  return json({ users });
}

type Action =
  | { action: "update"; uid: string; role?: "admin" | "coach"; status?: "active" | "disabled" | "pending"; clubs?: string[]; name?: string }
  | { action: "resetPassword"; uid: string }
  | { action: "delete"; uid: string };

export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  const me = await getUser(req);
  if (!me) return json({ error: "auth" }, 401);
  if (me.role !== "admin") return json({ error: "forbidden" }, 403);
  try {
    const a = (await req.json().catch(() => ({}))) as Action;
    if (!a || !UID.test(String(a.uid))) return json({ error: "bad request" }, 400);
    if (a.uid === me.uid && a.action !== "resetPassword") {
      // Un admin ne peut pas se retirer ses propres droits ni se supprimer (évite de perdre l'accès admin).
      if (a.action === "delete" || (a.action === "update" && (a.role === "coach" || (a.status && a.status !== "active")))) {
        return json({ error: "self" }, 400);
      }
    }
    if (a.action === "update") {
      const u = await patchUser(a.uid, (cur) => {
        const next = { ...cur };
        if (a.role === "admin" || a.role === "coach") next.role = a.role;
        if (a.status === "active" || a.status === "disabled" || a.status === "pending") {
          if (a.status !== cur.status && a.status !== "active") next.sv = (cur.sv || 1) + 1; // coupe les sessions ouvertes
          next.status = a.status;
        }
        if (Array.isArray(a.clubs)) next.clubs = a.clubs.filter((c) => ID.test(String(c))).slice(0, 50);
        if (typeof a.name === "string" && a.name.trim()) next.name = a.name.trim().slice(0, 40);
        return next;
      });
      if (!u) return json({ error: "not found" }, 404);
      return json({ user: publicUser(u) });
    }
    if (a.action === "resetPassword") {
      const pw = tempPassword();
      const hash = await hashPassword(pw);
      const u = await patchUser(a.uid, (cur) => ({ ...cur, hash, sv: (cur.sv || 1) + 1, fails: 0, lockUntil: 0 }));
      if (!u) return json({ error: "not found" }, 404);
      return json({ password: pw });
    }
    if (a.action === "delete") {
      const d = await readDoc(userPath(a.uid));
      if (!d) return json({ ok: true });
      await deleteDoc(emailPath(String(d.data.email)));
      await deleteDoc(userPath(a.uid));
      forgetUser(a.uid);
      usersChanged();
      await touchRev();
      return json({ ok: true });
    }
    return json({ error: "bad action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
