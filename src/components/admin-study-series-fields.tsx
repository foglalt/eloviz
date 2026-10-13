"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  options: { id: string; title: string; nextPosition: number }[];
  initialSeriesId?: string | null;
  initialPosition?: number;
};

export function AdminStudySeriesFields({ options, initialSeriesId, initialPosition = 1 }: Props) {
  const [seriesId, setSeriesId] = useState(initialSeriesId ?? "");
  const [position, setPosition] = useState(initialPosition);
  return (
    <fieldset className="field field--full study-series-fields">
      <legend>Tanulmánysorozat</legend>
      <div className="study-series-fields__grid">
        <div className="field">
          <label htmlFor="seriesId">Sorozat</label>
          <select id="seriesId" name="seriesId" value={seriesId} onChange={(event) => {
            const id = event.target.value;
            setSeriesId(id);
            setPosition(id === initialSeriesId ? initialPosition : options.find((option) => option.id === id)?.nextPosition ?? 1);
          }}>
            <option value="">Önálló tanulmány</option>
            {options.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}
          </select>
        </div>
        {seriesId ? (
          <div className="field">
            <label htmlFor="seriesPosition">Rész sorszáma</label>
            <input id="seriesPosition" name="seriesPosition" type="number" min="1" max="10000" required value={position} onChange={(event) => setPosition(Number(event.target.value))} />
          </div>
        ) : <input type="hidden" name="seriesPosition" value="1" />}
      </div>
      <p className="field-help">A megadott helyre beszúrjuk ezt a részt; a többi rész sorrendje automatikusan igazodik. A sorozat és a részek külön publikálhatók.</p>
      <Link className="text-link" href={seriesId ? `/admin/sorozatok?edit=${seriesId}` : "/admin/sorozatok"}>{seriesId ? "Sorozat és sorrend szerkesztése" : "Új sorozat létrehozása"}</Link>
    </fieldset>
  );
}
