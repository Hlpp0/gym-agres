import { json } from "@/lib/blobdb";
import { csrfOk, getUser, patchUser, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Modifier son nom affiché et son N° personnel BDNS.
export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  const me = await getUser(req);
  if (!me) return json({ error: "auth" }, 401);
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: string; bdns?: string };
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 40) : undefined;
    const bdns = typeof body.bdns === "string" ? body.bdns.replace(/\D/g, "").slice(0, 12) : undefined;
    const u = await patchUser(me.uid, (cur) => ({ ...cur, ...(name ? { name } : {}), ...(bdns !== undefined ? { bdns } : {}) }));
    if (!u) return json({ error: "auth" }, 401);
    return json({ user: publicUser(u) });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
