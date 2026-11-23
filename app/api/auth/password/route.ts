import { json } from "@/lib/blobdb";
import { csrfOk, getUser, hashPassword, makeToken, patchUser, sessionCookie, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Changer son propre mot de passe (déconnecte les autres appareils).
export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  const me = await getUser(req);
  if (!me) return json({ error: "auth" }, 401);
  try {
    const body = (await req.json().catch(() => ({}))) as { current?: string; next?: string };
    const next = String(body.next || "");
    if (next.length < 10 || next.length > 200) return json({ error: "password" }, 400);
    if (!(await verifyPassword(String(body.current || ""), me.hash))) return json({ error: "invalid" }, 401);
    const hash = await hashPassword(next);
    const u = await patchUser(me.uid, (cur) => ({ ...cur, hash, sv: (cur.sv || 1) + 1 }));
    if (!u) return json({ error: "auth" }, 401);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(makeToken(u)) });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
