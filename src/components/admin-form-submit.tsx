"use client";

import { useEffect, useEffectEvent, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { isSaveShortcut } from "@/lib/admin-save-shortcut";

type Props = {
  label: string;
  pendingLabel?: string;
  className?: string;
  enableSaveShortcut?: boolean;
};

export function AdminFormSubmit({
  label,
  pendingLabel = "Mentés folyamatban…",
  className = "button button--primary",
  enableSaveShortcut = false,
}: Props) {
  const { pending } = useFormStatus();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shortcutSubmittingRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (!pending) shortcutSubmittingRef.current = false;
  }, [pending]);

  const handleSaveShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || !isSaveShortcut(event)) return;
    event.preventDefault();

    if (event.repeat || pending || shortcutSubmittingRef.current) return;
    const button = buttonRef.current;
    const form = button?.form;
    if (!button || !form || !form.reportValidity()) return;

    shortcutSubmittingRef.current = true;
    form.requestSubmit(button);
  });

  useEffect(() => {
    if (!enableSaveShortcut) return;

    function handleKeyDown(event: KeyboardEvent) {
      handleSaveShortcut(event);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableSaveShortcut]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (pending && !dialog.open) {
      dialog.showModal();
    } else if (!pending && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [pending]);

  return (
    <>
      <button
        ref={buttonRef}
        className={className}
        type="submit"
        disabled={pending}
        aria-keyshortcuts={enableSaveShortcut ? "Control+S Meta+S" : undefined}
        title={enableSaveShortcut ? `${label} (Ctrl+S / ⌘S)` : undefined}
      >
        {pending ? pendingLabel : label}
      </button>
      <dialog
        ref={dialogRef}
        className="admin-modal admin-saving-dialog"
        aria-labelledby={titleId}
        onCancel={(event) => event.preventDefault()}
      >
        <div className="admin-modal__card" role="status" aria-live="assertive">
          <span className="admin-spinner" aria-hidden="true" />
          <div>
            <h2 id={titleId}>{pendingLabel}</h2>
            <p>Kérlek, várj. Az oldal a mentés befejezése után automatikusan frissül.</p>
          </div>
        </div>
      </dialog>
    </>
  );
}
