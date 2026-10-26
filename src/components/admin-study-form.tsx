"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { saveStudyAction } from "@/app/admin/actions";
import { pdfFileIssue } from "@/lib/pdf-file-policy";

export function AdminStudyForm({ children }: { children: ReactNode }) {
  const [state, action] = useActionState(saveStudyAction, { error: "" });
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state]);
  return (
    // React resets action forms after a returned error too. Keep the browser's
    // selected File and uncontrolled inputs; a successful redirect remounts us.
    <form action={action} className="form-grid" onReset={(event) => event.preventDefault()}>
      {state.error ? <p ref={errorRef} tabIndex={-1} className="admin-notice admin-notice--error field--full" role="alert">{state.error}</p> : null}
      {children}
    </form>
  );
}

export function AdminInitialStudyPdf() {
  const [error, setError] = useState("");
  return (
    <div className="field field--full">
      <label htmlFor="initial-study-pdf">PDF-fájl <small>(nem kötelező)</small></label>
      <input id="initial-study-pdf" name="pdf" type="file" accept="application/pdf,.pdf"
        aria-describedby="initial-study-pdf-help" aria-invalid={error ? true : undefined}
        onChange={(event) => {
          const issue = pdfFileIssue(event.currentTarget.files?.[0]);
          event.currentTarget.setCustomValidity(issue);
          setError(issue);
        }}
      />
      <small id="initial-study-pdf-help" className="field-help" role={error ? "alert" : undefined}>
        {error || "Legfeljebb 12 MB. A PDF-et az adatokkal együtt mentjük és dolgozzuk fel."}
      </small>
    </div>
  );
}
