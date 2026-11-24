import { get, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { json } from "@/lib/blobdb";
import { csrfOk, getUser } from "@/lib/auth";

// Médias de la bibliothèque (images, GIF, courtes vidéos) envoyés par l'admin.
// Stockés dans le Blob PRIVÉ (media/{uuid}.{ext}) et servis seulement aux comptes actifs.
// Limite 4 Mo (corps de requête des fonctions Vercel : 4,5 Mo). Vidéos longues : lien YouTube, Vimeo ou Drive.

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MIME: Record<string, string> = Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m]));
const KEY = /^[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|mov)$/;
const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!csrfOk(req)) return json({ error: "csrf" }, 403);
  try {
    const u = await getUser(req);
    if (!u) return json({ error: "auth" }, 401);
    if (u.role !== "admin") return json({ error: "admin only" }, 403);
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string") return json({ error: "no file" }, 400);
    const ext = TYPES[file.type];
    if (!ext) return json({ error: "type" }, 415);
    if (file.size > MAX) return json({ error: "too large" }, 413);
    const key = `${randomUUID()}.${ext}`;
    await put(`media/${key}`, Buffer.from(await file.arrayBuffer()), {
      access: "private",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return json({ url: `/api/media?k=${key}`, type: file.type.startsWith("video") ? "video" : "img" });
  } catch (e) {
    console.error(e);
    return json({ error: "server" }, 500);
  }
}

export async function GET(req: Request) {
  try {
    const u = await getUser(req);
    if (!u) return new Response("auth", { status: 401 });
    const key = new URL(req.url).searchParams.get("k") || "";
    if (!KEY.test(key)) return new Response("bad key", { status: 400 });
    const r = await get(`media/${key}`, { access: "private" });
    if (!r || r.statusCode !== 200) return new Response("not found", { status: 404 });
    const buf = new Uint8Array(await new Response(r.stream).arrayBuffer());
    const type = MIME[key.split(".").pop() as string] || "application/octet-stream";
    const base = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400" };
    // Lecture par plages (nécessaire aux vidéos sur iPhone).
    const m = (req.headers.get("range") || "").match(/^bytes=(\d*)-(\d*)$/);
    if (m && (m[1] || m[2])) {
      let start = m[1] ? +m[1] : Math.max(0, buf.length - +m[2]);
      let end = m[1] && m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
      if (start >= buf.length || start > end) {
        return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${buf.length}` } });
      }
      start = Math.max(0, start);
      end = Math.max(start, end);
      return new Response(buf.slice(start, end + 1), {
        status: 206,
        headers: { ...base, "Content-Range": `bytes ${start}-${end}/${buf.length}`, "Content-Length": String(end - start + 1) },
      });
    }
    return new Response(buf, { headers: { ...base, "Content-Length": String(buf.length) } });
  } catch (e) {
    console.error(e);
    return new Response("server", { status: 500 });
  }
}
