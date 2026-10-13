"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  subscribeToNewsletterAction,
  type NewsletterActionState,
} from "@/app/(site)/newsletter-actions";

const NOTICE_STORAGE_KEY = "eloviz:first-visit-updates:v3";
const NOTICE_COOKIE_NAME = "eloviz_first_visit_updates_v3";
const INITIAL_NEWSLETTER_STATE: NewsletterActionState = { status: "idle", message: "" };

function hasSeenNotice() {
  if (document.cookie.split("; ").some((cookie) => cookie.startsWith(`${NOTICE_COOKIE_NAME}=`))) {
    return true;
  }

  try {
    return Boolean(window.localStorage.getItem(NOTICE_STORAGE_KEY));
  } catch {
    return false;
  }
}

function rememberNotice(reason: "dismissed" | "subscribed") {
  document.cookie = `${NOTICE_COOKIE_NAME}=${reason}; Max-Age=31536000; Path=/; SameSite=Lax`;
  try {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, reason);
  } catch {
    // The cookie still preserves the dismissal when local storage is unavailable.
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button first-visit-notice__submit" type="submit" disabled={pending}>
      {pending ? "Feliratkozás…" : "Értesítést kérek"}
    </button>
  );
}

export function FirstVisitNotice() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(subscribeToNewsletterAction, INITIAL_NEWSLETTER_STATE);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (hasSeenNotice()) return;

    if (!dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;
    rememberNotice("subscribed");
  }, [state.status]);

  function closeNotice(reason: "dismissed" | "subscribed") {
    rememberNotice(reason);
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="first-visit-notice"
      aria-labelledby="first-visit-title"
      onCancel={(event) => {
        event.preventDefault();
        closeNotice("dismissed");
      }}
    >
      <div className="first-visit-notice__inner">
        <button
          className="first-visit-notice__close"
          type="button"
          aria-label="Tájékoztató bezárása"
          onClick={() => closeNotice("dismissed")}
        >
          <span aria-hidden="true">×</span>
        </button>

        {state.status === "success" ? (
          <div className="first-visit-notice__success" role="status">
            <span className="first-visit-notice__success-mark" aria-hidden="true">✓</span>
            <p className="eyebrow">Sikeres feliratkozás</p>
            <h2 id="first-visit-title">Örülünk, hogy velünk tartasz</h2>
            <p>{state.message}</p>
            <button className="button" type="button" onClick={() => closeNotice("subscribed")}>Folytatom az olvasást</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Első látogatásod?</p>
            <h2 id="first-visit-title">Az Élő Víz még formálódik</h2>
            <p className="first-visit-notice__lead">
              Az oldal fejlesztés alatt áll, a gyűjteményt pedig folyamatosan bővítjük új tanulmányokkal és más értékes tartalmakkal.
            </p>
            <p className="first-visit-notice__invitation">
              Add meg az e-mail-címed, és értesítünk, amikor új tartalom kerül fel.
            </p>

            <form action={formAction} className="first-visit-notice__form" noValidate>
              <div className="first-visit-notice__field">
                <label htmlFor="newsletter-email">E-mail-cím</label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nev@pelda.hu"
                  aria-invalid={state.status === "error"}
                  aria-describedby={state.status === "error" ? "newsletter-status" : undefined}
                  required
                  autoFocus
                />
              </div>
              <div className="newsletter-honeypot" aria-hidden="true" hidden>
                <label htmlFor="newsletter-website">Weboldal</label>
                <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <label className="first-visit-notice__consent">
                <input name="consent" type="checkbox" required />
                <span>Hozzájárulok, hogy az Élő Víz az e-mail-címemet az oldal új tartalmairól szóló értesítésekhez használja.</span>
              </label>
              {state.status === "error" ? <p className="first-visit-notice__status" id="newsletter-status" role="alert">{state.message}</p> : null}
              <div className="first-visit-notice__actions">
                <SubmitButton />
                <button className="first-visit-notice__later" type="button" onClick={() => closeNotice("dismissed")}>Most nem kérek értesítést</button>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
