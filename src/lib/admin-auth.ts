import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "eloviz-admin-session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

type LoginRecord = { attempts: number; startedAt: number };

const globalForLoginLimits = globalThis as typeof globalThis & {
  elovizLoginLimits?: Map<string, LoginRecord>;
};

const loginLimits = globalForLoginLimits.elovizLoginLimits ?? new Map<string, LoginRecord>();
globalForLoginLimits.elovizLoginLimits = loginLimits;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function createSignature(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    role: "admin",
    exp: Date.now() + SESSION_LIFETIME_SECONDS * 1000,
    nonce: randomBytes(12).toString("base64url"),
  })).toString("base64url");

  return `${payload}.${createSignature(payload)}`;
}

function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !isAdminAuthConfigured()) return false;
  if (!safeEqual(signature, createSignature(payload))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
      role?: string;
    };
    return parsed.role === "admin" && typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminPassword() && getSessionSecret());
}

export function isLoginRateLimited(key: string) {
  const now = Date.now();
  const current = loginLimits.get(key);
  if (!current || now - current.startedAt > LOGIN_WINDOW_MS) {
    loginLimits.set(key, { attempts: 0, startedAt: now });
    return false;
  }
  return current.attempts >= MAX_LOGIN_ATTEMPTS;
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const current = loginLimits.get(key);
  if (!current || now - current.startedAt > LOGIN_WINDOW_MS) {
    loginLimits.set(key, { attempts: 1, startedAt: now });
  } else {
    current.attempts += 1;
  }
}

export function clearLoginFailures(key: string) {
  loginLimits.delete(key);
}

export function verifyAdminPassword(passwordAttempt: string) {
  const configuredPassword = getAdminPassword();
  return Boolean(configuredPassword) && safeEqual(configuredPassword, passwordAttempt.trim());
}

export async function createAdminSession() {
  if (!isAdminAuthConfigured()) {
    throw new Error("Az ADMIN_PASSWORD és ADMIN_SESSION_SECRET környezeti változók beállítása szükséges.");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  if (!isAdminAuthConfigured()) return false;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return sessionToken ? verifySessionToken(sessionToken) : false;
}
