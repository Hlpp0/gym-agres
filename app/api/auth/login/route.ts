import { json } from "@/lib/blobdb";
import { csrfOk, findUserByEmail, makeToken, normalizeEmail, patchUser, publicUser, sessionCookie, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = normalizeEmail(body.email || "");
    const password = String(body.password || "");
    const u = await findUserByEmail(email);
    if (!u) {
      await new Promise((r) => setTimeout(r, 300));
      return json({ error: "invalid" }, 401);
    }
    if (u.lockUntil && u.lockUntil > Date.now()) return json({ error: "locked" }, 429);
    const ok = await verifyPassword(password, u.hash);
    if (!ok) {
      await patchUser(u.uid, (cur) => {
        const fails = (cur.fails || 0) + 1;
        return { ...cur, fails: fails >= MAX_FAILS ? 0 : fails, lockUntil: fails >= MAX_FAILS ? Date.now() + LOCK_MS : cur.lockUntil };
      });
      return json({ error: "invalid" }, 401);
    }
    if (u.fails || u.lockUntil) await patchUser(u.uid, (cur) => ({ ...cur, fails: 0, lockUntil: 0 }));
    if (u.status === "pending") return json({ error: "pending", user: publicUser(u) }, 403);
    if (u.status !== "active") return json({ error: "disabled" }, 403);
    return json({ user: publicUser(u) }, 200, { "Set-Cookie": sessionCookie(makeToken(u)) });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
