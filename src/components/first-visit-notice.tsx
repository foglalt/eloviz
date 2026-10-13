"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NewsletterSignupForm } from "./newsletter-signup-form";

const storageKey = "eloviz:first-visit-updates:v3";
const cookieName = "eloviz_first_visit_updates_v3";

function hasSeenNotice() {
  if (document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`))) return true;
  try { return Boolean(window.localStorage.getItem(storageKey)); } catch { return false; }
}

function rememberNotice(reason: "dismissed" | "subscribed") {
  document.cookie = `${cookieName}=${reason}; Max-Age=31536000; Path=/; SameSite=Lax`;
  try { window.localStorage.setItem(storageKey, reason); } catch { /* Cookie preserves dismissal. */ }
}

export function FirstVisitNotice() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pathname.startsWith("/feliratkozas")) { dialog.close(); return; }
    if (!hasSeenNotice() && !dialog.open) dialog.showModal();
  }, [pathname]);
  function closeNotice() { rememberNotice("dismissed"); dialogRef.current?.close(); }
  return <dialog ref={dialogRef} className="first-visit-notice" aria-labelledby="first-visit-title" onCancel={(event) => { event.preventDefault(); closeNotice(); }}>
    <div className="first-visit-notice__inner"><button className="first-visit-notice__close" type="button" aria-label="Tájékoztató bezárása" onClick={closeNotice}><span aria-hidden="true">×</span></button>
      <p className="eyebrow">Első látogatásod?</p><h2 id="first-visit-title">Az Élő Víz még formálódik</h2>
      <p className="first-visit-notice__lead">Az oldal fejlesztés alatt áll, a gyűjteményt pedig folyamatosan bővítjük új tanulmányokkal és más értékes tartalmakkal.</p>
      <p className="first-visit-notice__invitation">Kérd a heti értesítőt: vasárnap este összegyűjtjük neked az új tartalmakat.</p>
      <NewsletterSignupForm onSuccess={() => rememberNotice("subscribed")} onDismiss={closeNotice} />
    </div>
  </dialog>;
}
