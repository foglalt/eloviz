export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function clampNonNegativeInt(value: unknown, max?: number) {
  const numericValue =
    typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : 0;
  const minimumApplied = Math.max(numericValue, 0);

  if (typeof max !== "number") {
    return minimumApplied;
  }

  return Math.min(minimumApplied, Math.max(max, 0));
}
