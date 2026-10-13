"use client";

import { useActionState, useEffect, useEffectEvent, useId, useState } from "react";
import { subscribeToNewsletterAction, type NewsletterActionState } from "@/app/(site)/newsletter-actions";

const initialState: NewsletterActionState = { status: "idle", message: "" };

export function NewsletterSignupForm({ onSuccess, onDismiss }: { onSuccess?: () => void; onDismiss?: () => void }) {
  const [state, action, pending] = useActionState(subscribeToNewsletterAction, initialState);
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const notifySuccess = useEffectEvent(() => onSuccess?.());
  useEffect(() => { if (state.status === "success") notifySuccess(); }, [state.status]);
  if (state.status === "success") return <div className="first-visit-notice__success" role="status"><p className="eyebrow">Ellenőrizd a postaládádat</p><p>{state.message}</p>{onDismiss ? <button className="button" type="button" onClick={onDismiss}>Folytatom az olvasást</button> : null}</div>;

  return <form action={action} className="first-visit-notice__form" noValidate onReset={(event) => event.preventDefault()}>
    <div className="first-visit-notice__field"><label htmlFor={`${id}-email`}>E-mail-cím</label><input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" placeholder="nev@pelda.hu" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required aria-invalid={state.status === "error"} aria-describedby={state.status === "error" ? `${id}-status` : undefined} /></div>
    <div className="newsletter-honeypot" aria-hidden="true" hidden><label htmlFor={`${id}-website`}>Weboldal</label><input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
    <label className="first-visit-notice__consent"><input name="consent" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>Hozzájárulok, hogy az Élő Víz az e-mail-címemet az oldal új tartalmairól szóló heti értesítőhöz használja. Bármelyik levélben leiratkozhatok.</span></label>
    {state.status === "error" ? <p className="first-visit-notice__status" id={`${id}-status`} role="alert">{state.message}</p> : null}
    <div className="first-visit-notice__actions"><button className="button first-visit-notice__submit" type="submit" disabled={pending}>{pending ? "Feliratkozás…" : "Értesítést kérek"}</button>{onDismiss ? <button className="first-visit-notice__later" type="button" onClick={onDismiss}>Most nem kérek értesítést</button> : null}</div>
  </form>;
}
