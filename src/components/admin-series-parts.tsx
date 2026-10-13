"use client";

import Link from "next/link";
import { useState } from "react";
import { moveSeriesPart } from "@/lib/study-series-core";

type Option = { id: string; title: string; status: "draft" | "published"; seriesId: string | null };
type Props = { seriesId?: string; options: Option[]; initialIds: string[] };

export function AdminSeriesParts({ seriesId, options, initialIds }: Props) {
  const [partIds, setPartIds] = useState(initialIds);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const available = options.filter((option) => !partIds.includes(option.id)
    && (!option.seriesId || option.seriesId === seriesId)
    && option.title.toLocaleLowerCase("hu").includes(search.toLocaleLowerCase("hu")));

  function move(id: string, direction: -1 | 1) {
    const next = moveSeriesPart(partIds, id, direction);
    setPartIds(next);
    setAnnouncement(`${options.find((part) => part.id === id)?.title}: ${next.indexOf(id) + 1}. rész.`);
  }

  return (
    <fieldset className="field field--full series-editor-parts">
      <legend>A sorozat részei</legend>
      <p className="field-help">A sorrendet a nyilakkal módosíthatod. Az eltávolítás csak a sorozatból veszi ki a részt; a tanulmány megmarad. A változások mentéskor lépnek életbe.</p>
      <ol className="series-editor-list">
        {partIds.map((id, index) => {
          const part = options.find((option) => option.id === id);
          if (!part) return null;
          return (
            <li key={id}>
              <input type="hidden" name="partIds" value={id} />
              <span className="series-part-number">{index + 1}.</span>
              <span className="series-editor-list__title"><Link href={`/admin/tanulmanyok?edit=${id}`}>{part.title}</Link><small>{part.status === "draft" ? "Vázlat · csak a szerkesztőségben látható" : "Publikált"}</small></span>
              <div className="series-editor-list__controls">
                <button type="button" disabled={index === 0} aria-label={`${part.title}: feljebb`} onClick={() => move(id, -1)}>↑</button>
                <button type="button" disabled={index === partIds.length - 1} aria-label={`${part.title}: lejjebb`} onClick={() => move(id, 1)}>↓</button>
                <button type="button" aria-label={`${part.title}: eltávolítás a sorozatból`} onClick={() => {
                  setPartIds(partIds.filter((partId) => partId !== id));
                  setAnnouncement(`${part.title} kikerül a sorozatból a mentés után.`);
                }}>×</button>
              </div>
            </li>
          );
        })}
      </ol>
      {!partIds.length ? <p className="field-help">Még nincs rész. Adj hozzá meglévő tanulmányt, vagy mentés után hozz létre új részt.</p> : null}
      <label htmlFor="series-study-search">Meglévő tanulmány keresése</label>
      <input id="series-study-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(""); }} placeholder="Keresés cím alapján" />
      <div className="series-editor-add">
        <label className="visually-hidden" htmlFor="series-study-option">Hozzáadható tanulmány</label>
        <select id="series-study-option" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">{available.length ? "Válassz tanulmányt…" : "Nincs hozzáadható találat"}</option>
          {available.map((part) => <option key={part.id} value={part.id}>{part.title}{part.status === "draft" ? " (vázlat)" : ""}</option>)}
        </select>
        <button type="button" className="button" disabled={!selectedId} onClick={() => {
          if (!selectedId || !available.some((part) => part.id === selectedId)) return;
          setPartIds([...partIds, selectedId]);
          setSelectedId("");
          setSearch("");
          setAnnouncement("A tanulmány a sorozat végére került. Mentsd el a változásokat.");
        }}>Hozzáadás</button>
      </div>
      <p className="field-help">Másik sorozat részeit a tanulmány szerkesztőjében helyezheted át.</p>
      <span className="visually-hidden" role="status">{announcement}</span>
    </fieldset>
  );
}
