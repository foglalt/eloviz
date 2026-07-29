import assert from "node:assert/strict";
import test from "node:test";
import { isSaveShortcut } from "./admin-save-shortcut.ts";

function keyboardEvent(overrides: Partial<Parameters<typeof isSaveShortcut>[0]> = {}) {
  return {
    altKey: false,
    ctrlKey: false,
    key: "s",
    metaKey: false,
    shiftKey: false,
    ...overrides,
  };
}

test("recognizes Ctrl+S", () => {
  assert.equal(isSaveShortcut(keyboardEvent({ ctrlKey: true })), true);
});

test("recognizes Command+S and an uppercase key", () => {
  assert.equal(isSaveShortcut(keyboardEvent({ key: "S", metaKey: true })), true);
});

test("does not treat an unmodified S as save", () => {
  assert.equal(isSaveShortcut(keyboardEvent()), false);
});

test("leaves browser and editor variants with extra modifiers alone", () => {
  assert.equal(isSaveShortcut(keyboardEvent({ ctrlKey: true, shiftKey: true })), false);
  assert.equal(isSaveShortcut(keyboardEvent({ altKey: true, ctrlKey: true })), false);
});
