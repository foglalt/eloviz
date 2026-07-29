type SaveShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
>;

export function isSaveShortcut(event: SaveShortcutEvent) {
  return (
    event.key.toLowerCase() === "s"
    && (event.ctrlKey || event.metaKey)
    && !event.altKey
    && !event.shiftKey
  );
}
