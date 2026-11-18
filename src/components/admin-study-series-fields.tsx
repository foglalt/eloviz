"use client";

import Link from "next/link";
import { useState } from "react";
import type { SeriesPartKind } from "@/lib/study-series-core";

type Props = {
  options: { id: string; title: string; nextLessonPosition: number; nextSupplementPosition: number }[];
  initialSeriesId?: string | null;
  initialPosition?: number;
  initialKind?: SeriesPartKind;
};

export function AdminStudySeriesFields({ options, initialSeriesId, initialPosition = 1, initialKind = "lesson" }: Props) {
  const [seriesId, setSeriesId] = useState(initialSeriesId ?? "");
  const [kind, setKind] = useState(initialKind);
  const [position, setPosition] = useState(initialPosition);

  function suggestedPosition(id: string, newKind: SeriesPartKind) {
    if (id === initialSeriesId && newKind === initialKind) return initialPosition;
    const series = options.find((option) => option.id === id);
    return (newKind === "supplement" ? series?.nextSupplementPosition : series?.nextLessonPosition) ?? 1;
  }

  return <fieldset className="field field--full study-series-fields">
    <legend>Tanulmánysorozat</legend>
    <div className="study-series-fields__grid">
      <div className="field">
        <label htmlFor="seriesId">Sorozat</label>
        <select id="seriesId" name="seriesId" value={seriesId} onChange={(event) => {
          const id = event.target.value;
          setSeriesId(id); setPosition(suggestedPosition(id, kind));
        }}>
          <option value="">Önálló tanulmány</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
        </select>
      </div>
      {seriesId ? <>
        <div className="field">
          <label htmlFor="seriesKind">Típus</label>
          <select id="seriesKind" name="seriesKind" value={kind} onChange={(event) => {
            const newKind = event.target.value as SeriesPartKind;
            setKind(newKind); setPosition(suggestedPosition(seriesId, newKind));
          }}><option value="lesson">Lecke</option><option value="supplement">Melléklet</option></select>
        </div>
        <div className="field">
          <label htmlFor="seriesPosition">{kind === "supplement" ? "Melléklet sorszáma" : "Lecke sorszáma"}</label>
          <input id="seriesPosition" name="seriesPosition" type="number" min="1" max="10000" required value={position} onChange={(event) => setPosition(Number(event.target.value))} />
        </div>
      </> : <><input type="hidden" name="seriesPosition" value="1" /><input type="hidden" name="seriesKind" value="lesson" /></>}
    </div>
    <p className="field-help">A megadott helyre beszúrjuk az anyagot a saját csoportjában. A sorozat és az anyagai külön publikálhatók.</p>
    <Link className="text-link" href={seriesId ? `/admin/sorozatok?edit=${seriesId}` : "/admin/sorozatok"}>{seriesId ? "Sorozat és sorrend szerkesztése" : "Új sorozat létrehozása"}</Link>
  </fieldset>;
}
