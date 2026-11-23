import { json } from "@/lib/blobdb";
import { clearCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie });
}
