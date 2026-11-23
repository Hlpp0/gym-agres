import { json, readDoc, writeDoc } from "@/lib/blobdb";
import {
  adminEmails, csrfOk, emailPath, hashPassword, makeToken, newUid, normalizeEmail, publicUser, saveUser,
  sessionCookie, validEmail, type User,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string };
    const email = normalizeEmail(body.email || "");
    const password = String(body.password || "");
    const name = String(body.name || "").trim().slice(0, 40);
    if (!validEmail(email)) return json({ error: "email" }, 400);
    if (password.length < 10 || password.length > 200) return json({ error: "password" }, 400);
    if (!name) return json({ error: "name" }, 400);
    if (await readDoc(emailPath(email))) return json({ error: "exists" }, 409);
    const isAdmin = adminEmails().includes(email);
    const u: User = {
      uid: newUid(), email, name, hash: await hashPassword(password),
      role: isAdmin ? "admin" : "coach", status: isAdmin ? "active" : "pending",
      clubs: [], sv: 1, created: new Date().toISOString(),
    };
    await saveUser(u);
    await writeDoc(emailPath(email), { uid: u.uid });
    const headers: Record<string, string> = u.status === "active" ? { "Set-Cookie": sessionCookie(makeToken(u)) } : {};
    return json({ user: publicUser(u) }, 201, headers);
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
