import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "eloviz-admin-session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function createSignature(encodedPayload: string, password: string) {
  return createHmac("sha256", password).update(encodedPayload).digest("base64url");
}

function createSessionToken(password: string) {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + SESSION_LIFETIME_SECONDS * 1000,
    }),
  ).toString("base64url");

  const signature = createSignature(payload, password);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string, password: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = createSignature(payload, password);

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

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

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function verifyAdminPassword(passwordAttempt: string) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  return safeEqual(configuredPassword, passwordAttempt.trim());
}

export async function createAdminSession() {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    throw new Error("Az ADMIN_PASSWORD környezeti változó nincs beállítva.");
  }

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(configuredPassword), {
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
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return false;
  }

  return verifySessionToken(sessionToken, configuredPassword);
}
