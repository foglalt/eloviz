"use client";

import { type ReactNode, useId, useState } from "react";

export function StudyFootnote({ number, children }: { number: number; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const label = `${number}. megjegyzés ${open ? "elrejtése" : "megjelenítése"}`;

  return <span className="study-footnote">
    <button type="button" className="study-footnote__toggle" aria-label={label} title={label}
      aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <span aria-hidden="true">i</span>
    </button>
    <span id={id} className="study-footnote__text" hidden={!open}>{children}</span>
  </span>;
}
