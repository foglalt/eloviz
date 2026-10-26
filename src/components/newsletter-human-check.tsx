"use client";

import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { NEWSLETTER_TURNSTILE_ACTION } from "@/lib/newsletter-human-core";

type Turnstile = {
  render: (container: HTMLElement, options: {
    sitekey: string; action: string; language: string; size: string; theme: string;
    "response-field": boolean; callback: (token: string) => void;
    "error-callback": () => void; "expired-callback": () => void; "timeout-callback": () => void;
  }) => string;
  remove: (id: string) => void;
};

function turnstile() {
  return (window as Window & { turnstile?: Turnstile }).turnstile;
}

export function NewsletterHumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const changeToken = useEffectEvent(onToken);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  useEffect(() => {
    if (!ready || !siteKey || !containerRef.current) return;
    const api = turnstile();
    if (!api) return;
    let disposed = false;
    let widget: string | undefined;
    let size: string | undefined;
    const container = containerRef.current;
    const observer = new ResizeObserver(([entry]) => {
      if (disposed) return;
      const nextSize = entry.contentRect.width < 300 ? "compact" : "flexible";
      if (widget !== undefined && nextSize === size) return;
      if (widget !== undefined) api.remove(widget);
      changeToken("");
      size = nextSize;
      const invalidate = () => { if (!disposed) changeToken(""); };
      try {
        widget = api.render(container, {
          sitekey: siteKey, action: NEWSLETTER_TURNSTILE_ACTION, language: "hu", size, theme: "light",
          "response-field": false,
          callback: (token) => { if (!disposed) { setFailed(false); changeToken(token); } },
          "error-callback": () => { invalidate(); if (!disposed) setFailed(true); },
          "expired-callback": invalidate,
          "timeout-callback": () => { invalidate(); if (!disposed) setFailed(true); },
        });
      } catch { if (!disposed) setFailed(true); }
    });
    observer.observe(container);
    return () => { disposed = true; observer.disconnect(); if (widget !== undefined) api.remove(widget); };
  }, [ready, siteKey, retry]);

  useEffect(() => {
    if (!siteKey || ready) return;
    const timeout = window.setTimeout(() => setFailed(true), 15000);
    return () => window.clearTimeout(timeout);
  }, [siteKey, ready]);

  if (!siteKey) return <p className="first-visit-notice__status" role="status">A feliratkozás átmenetileg szünetel. Kérjük, nézz vissza később.</p>;
  return <div className="newsletter-human-check">
    <Script id="newsletter-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      onLoad={() => setReady(true)} onReady={() => setReady(true)} onError={() => { onToken(""); setFailed(true); }} />
    <div ref={containerRef} aria-label="Emberi ellenőrzés" />
    <small className="field-help">A robotvédelmet a Cloudflare biztosítja. <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Adatvédelem ↗</a></small>
    {!ready && !failed ? <p className="field-help" role="status">Emberi ellenőrzés betöltése…</p> : null}
    {failed ? <p className="first-visit-notice__status" role="alert">Az ellenőrzés nem sikerült. <button type="button" className="text-link" onClick={() => {
      onToken(""); setFailed(false);
      if (turnstile()) { setReady(true); setRetry((value) => value + 1); }
      else window.location.reload();
    }}>Újrapróbálom</button></p> : null}
  </div>;
}
