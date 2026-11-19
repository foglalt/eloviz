"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { saveStudyAction, suggestStudyPdfTitleAction } from "@/app/admin/actions";
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

export function AdminStudyTitleAndPdf() {
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const request = useRef(0);
  const lastSuggestion = useRef("");
  return (
    <>
    <div className="field field--full">
      <label htmlFor="title">Cím</label>
      <input id="title" name="title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} aria-describedby="initial-study-title-help" />
      <small id="initial-study-title-help" className="field-help">A PDF kiválasztásakor kitöltjük a felismert címet. Szabadon módosíthatod.</small>
    </div>
    <div className="field field--full">
      <label htmlFor="initial-study-pdf">PDF-fájl <small>(nem kötelező)</small></label>
      <input id="initial-study-pdf" name="pdf" type="file" accept="application/pdf,.pdf"
        aria-describedby="initial-study-pdf-help" aria-invalid={error ? true : undefined}
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          const currentRequest = ++request.current;
          const issue = pdfFileIssue(file);
          event.currentTarget.setCustomValidity(issue);
          setError(issue);
          setStatus("");
          if (!file || issue) return;
          const previousSuggestion = lastSuggestion.current;
          setStatus("Cím felismerése…");
          try {
            const data = new FormData();
            data.set("pdf", file);
            const result = await suggestStudyPdfTitleAction(data);
            if (currentRequest !== request.current) return;
            if (result.title) {
              const suggested = result.title;
              setTitle((current) => !current.trim() || current === previousSuggestion ? suggested : current);
              lastSuggestion.current = suggested;
              setStatus(`Felismert cím: ${suggested}`);
            } else setStatus(result.error || "Nem találtunk egyértelmű címet. Add meg kézzel.");
          } catch {
            if (currentRequest === request.current) setStatus("A cím felismerése nem sikerült. Add meg kézzel, vagy válaszd ki újra a PDF-et.");
          }
        }}
      />
      <small id="initial-study-pdf-help" className="field-help" role={error ? "alert" : undefined}>
        {error || "Legfeljebb 12 MB. A PDF-et az adatokkal együtt mentjük és dolgozzuk fel."}
      </small>
      <small className="field-help" role="status">{status}</small>
    </div>
    </>
  );
}
