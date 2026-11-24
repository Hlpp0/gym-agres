import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { json } from "@/lib/blobdb";
import { getUser } from "@/lib/auth";

// Envoi direct navigateur → Blob privé pour les fichiers lourds (vidéos jusqu'à 100 Mo).
// Ce point d'entrée ne fait que délivrer un jeton d'envoi, et seulement à un admin connecté.

export const dynamic = "force-dynamic";

const PATH = /^media\/[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|mov)$/;

export async function POST(req: Request) {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return json({ error: "type" }, 415);
  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return json({ error: "bad body" }, 400);
  try {
    const out = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const u = await getUser(req);
        if (!u || u.role !== "admin") throw new Error("admin only");
        if (!PATH.test(pathname)) throw new Error("bad path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return json(out);
  } catch (e) {
    const msg = (e as Error).message || "error";
    return json({ error: msg }, msg === "admin only" ? 403 : 400);
  }
}
