import { json } from "@/lib/blobdb";
import { getUser, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = await getUser(req);
    if (!u) return json({ error: "auth" }, 401);
    return json({ user: publicUser(u) });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}
