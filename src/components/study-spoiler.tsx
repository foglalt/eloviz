"use client";

import { useId, useState, type ReactNode } from "react";

export function StudySpoiler({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  return <span className="study-spoiler" data-revealed={revealed}>
    <button type="button" className="study-spoiler__toggle" aria-expanded={revealed} aria-controls={id}
      aria-label={revealed ? "Válasz elrejtése" : "Válasz megjelenítése"}
      title={revealed ? "Válasz elrejtése" : undefined} onClick={() => setRevealed(!revealed)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{revealed ? <path d="m3 3 18 18" /> : null}</svg>
      {!revealed ? <span>Válasz megjelenítése</span> : null}
    </button>
    <span id={id} className="study-spoiler__answer" hidden={!revealed}>{children}</span>
  </span>;
}
