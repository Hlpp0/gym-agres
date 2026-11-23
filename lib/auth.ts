import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readDoc, writeDoc, updateDoc, type Doc } from "./blobdb";

// Comptes GETUMA : email + mot de passe (scrypt), session dans un cookie HttpOnly signé (HMAC).
// Variables requises : SESSION_SECRET (aléatoire, 32+ caractères), ADMIN_EMAIL (emails admin, séparés par des virgules).

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export type User = {
  uid: string;
  email: string;
  name: string;
  hash: string;
  role: "admin" | "coach";
  status: "pending" | "active" | "disabled";
  clubs: string[];
  sv: number; // version de session : l'incrémenter déconnecte partout
  fails?: number;
  lockUntil?: number;
  created: string;
};

export const COOKIE = "gsess";
const SESSION_DAYS = 30;
export const userPath = (uid: string) => `users/${uid}.json`;
export const emailPath = (email: string) => `users-email/${createHash("sha256").update(normalizeEmail(email)).digest("hex")}.json`;

export function normalizeEmail(e: string) {
  return String(e || "").trim().toLowerCase();
}
export function validEmail(e: string) {
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e);
}
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || "").split(",").map(normalizeEmail).filter(Boolean);
}

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, s, h] = String(stored || "").split("$");
  if (alg !== "scrypt" || !s || !h) return false;
  const key = await scrypt(pw, Buffer.from(s, "base64"), 64);
  const ref = Buffer.from(h, "base64");
  return ref.length === key.length && timingSafeEqual(ref, key);
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET manquant");
  return s;
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}
export function makeToken(u: User) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `${u.uid}.${u.sv}.${exp}`;
  return `${payload}.${sign(payload)}`;
}
export function sessionCookie(token: string) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** Utilisateur actif de la requête, ou null. Vérifie signature, expiration, version de session et statut. */
export async function getUser(req: Request): Promise<User | null> {
  const tok = readCookie(req, COOKIE);
  if (!tok) return null;
  const parts = tok.split(".");
  if (parts.length !== 4) return null;
  const [uid, sv, exp, sig] = parts;
  const expected = sign(`${uid}.${sv}.${exp}`);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  if (!/^[a-z0-9]{8,40}$/.test(uid)) return null;
  const d = await readDoc(userPath(uid));
  if (!d) return null;
  const u = d.data as unknown as User;
  if (String(u.sv) !== sv || u.status !== "active") return null;
  return u;
}

/** Protection CSRF : les requêtes qui modifient doivent porter l'en-tête x-getuma (impossible à forger depuis un autre site). */
export function csrfOk(req: Request) {
  return req.headers.get("x-getuma") === "1";
}

export const publicUser = (u: User) => ({ uid: u.uid, email: u.email, name: u.name, role: u.role, status: u.status, clubs: u.clubs || [] });

export async function saveUser(u: User) {
  await writeDoc(userPath(u.uid), u as unknown as Doc);
}
export async function patchUser(uid: string, fn: (u: User) => User | null) {
  return (await updateDoc(userPath(uid), (cur) => (cur ? (fn(cur as unknown as User) as unknown as Doc | null) : null))) as unknown as User | null;
}
export async function findUserByEmail(email: string): Promise<User | null> {
  const idx = await readDoc(emailPath(email));
  if (!idx) return null;
  const d = await readDoc(userPath(String(idx.data.uid)));
  return d ? (d.data as unknown as User) : null;
}
export function newUid() {
  return randomBytes(12).toString("hex");
}
export function tempPassword() {
  const a = "abcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(12);
  let s = "";
  for (let i = 0; i < 12; i++) s += a[b[i] % a.length] + (i === 3 || i === 7 ? "-" : "");
  return s;
}
