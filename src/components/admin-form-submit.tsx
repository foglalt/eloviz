"use client";

import { useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export function AdminFormSubmit({
  label,
  pendingLabel = "Mentés folyamatban…",
  className = "button button--primary",
}: Props) {
  const { pending } = useFormStatus();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      <button className={className} type="submit" disabled={pending}>
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
