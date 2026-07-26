"use client";

import { useEffect, useId, useRef } from "react";

export function AdminSuccessDialog({ message }: { message?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!message || !dialog) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [message]);

  if (!message) return null;

  function dismiss() {
    dialogRef.current?.close();
    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    window.history.replaceState(window.history.state, "", url);
  }

  const title = message.toLocaleLowerCase("hu").includes("ment")
    ? "Mentés kész"
    : "Sikeres művelet";

  return (
    <dialog
      ref={dialogRef}
      className="admin-modal admin-success-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="admin-modal__card">
        <span className="admin-success-mark" aria-hidden="true">✓</span>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>{message}</p>
          <button className="button button--primary button--small" type="button" onClick={dismiss}>
            Rendben
          </button>
        </div>
      </div>
    </dialog>
  );
}
