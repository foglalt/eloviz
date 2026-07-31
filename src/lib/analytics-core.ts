const PUBLIC_INDEX_PATHS = new Set([
  "/",
  "/kereses",
  "/tanulmanyok",
  "/temak",
  "/videok",
]);

const PUBLIC_DETAIL_PATH = /^\/(?:tanulmanyok|temak|videok)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AUTOMATED_USER_AGENT = /bot|crawler|spider|headless|lighthouse|slurp|bingpreview|facebookexternalhit/i;

export function normalizeAnalyticsPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.length > 200) return null;
  if (value.includes("?") || value.includes("#") || value.includes("\\") || value.includes("//")) return null;

  const path = value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
  return PUBLIC_INDEX_PATHS.has(path) || PUBLIC_DETAIL_PATH.test(path) ? path : null;
}

export function isAutomatedAnalyticsUserAgent(userAgent: string | null) {
  return Boolean(userAgent && AUTOMATED_USER_AGENT.test(userAgent));
}
