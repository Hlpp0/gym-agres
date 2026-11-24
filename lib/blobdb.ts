import { list, get, put, del } from "@vercel/blob";

// Accès au Blob store privé : un document JSON par chemin.
export type Doc = Record<string, unknown>;

export async function readDoc(p: string): Promise<{ data: Doc; etag: string } | null> {
  const r = await get(p, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  const txt = await new Response(r.stream).text();
  return { data: JSON.parse(txt) as Doc, etag: r.blob.etag };
}

export async function writeDoc(p: string, data: Doc, etag?: string) {
  return put(p, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

export async function deleteDoc(p: string) {
  await del(p).catch(() => {});
}

export async function listPaths(prefix: string): Promise<string[]> {
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    r.blobs.forEach((b) => paths.push(b.pathname));
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return paths;
}

export function deepMerge(a: Doc | undefined, b: Doc): Doc {
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

/** Lecture, modification, écriture conditionnelle (ifMatch), avec quelques essais en cas de conflit. */
export async function updateDoc(p: string, fn: (cur: Doc | null) => Doc | null): Promise<Doc | null> {
  for (let i = 0; i < 4; i++) {
    const cur = await readDoc(p);
    const next = fn(cur ? cur.data : null);
    if (next === null) return cur ? cur.data : null;
    try {
      await writeDoc(p, next, cur?.etag);
      return next;
    } catch (e) {
      const err = e as Error;
      if (err.name !== "BlobPreconditionFailedError" && !/precondition/i.test(err.message || "")) throw e;
    }
  }
  throw new Error("conflict");
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Numéro de révision de la base : changé à chaque écriture, pour que les clients et les instances sachent qu'il faut relire. */
export const REV_PATH = "db/_rev.json";
export async function touchRev() {
  const v = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await writeDoc(REV_PATH, { v });
  return v;
}
