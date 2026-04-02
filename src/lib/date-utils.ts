export function formatHuTimestamp(value?: string | null, fallback?: string) {
  if (!value) {
    return fallback ?? "Még nincs adat.";
  }

  return new Intl.DateTimeFormat("hu-HU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
