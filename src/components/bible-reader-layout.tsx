"use client";

import { useState, type ReactNode } from "react";

export function BibleReaderLayout({ navigation, children, hasConnectedStudies }: {
  navigation: ReactNode;
  children: ReactNode;
  hasConnectedStudies: boolean;
}) {
  const [showStudies, setShowStudies] = useState(false);

  return (
    <div className="bible-reader-grid" data-studies-visible={showStudies}>
      <aside className="bible-reader-navigation">
        {navigation}
        <div className="bible-study-toggle">
          <button type="button" aria-expanded={showStudies} aria-controls="bible-verses" onClick={() => setShowStudies((visible) => !visible)}>
            <span aria-hidden="true">{showStudies ? "−" : "+"}</span>
            {showStudies ? "Kapcsolódó tanulmányok elrejtése" : "Kapcsolódó tanulmányok megjelenítése"}
          </button>
          {showStudies && !hasConnectedStudies ? <p>Ehhez a fejezethez még nincs kapcsolódó tanulmány.</p> : null}
        </div>
      </aside>
      {children}
    </div>
  );
}
