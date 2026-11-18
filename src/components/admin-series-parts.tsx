"use client";

import Link from "next/link";
import { useState } from "react";
import { moveSeriesPart, type SeriesPartKind } from "@/lib/study-series-core";

type Option = { id: string; title: string; status: "draft" | "published"; seriesId: string | null };
type Props = { seriesId?: string; options: Option[]; initialIds: string[]; initialSupplementIds: string[] };

export function AdminSeriesParts({ seriesId, options, initialIds, initialSupplementIds }: Props) {
  const [groups, setGroups] = useState({ lesson: initialIds, supplement: initialSupplementIds });
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedKind, setSelectedKind] = useState<SeriesPartKind>("lesson");
  const [announcement, setAnnouncement] = useState("");
  const allIds = [...groups.lesson, ...groups.supplement];
  const available = options.filter((option) => !allIds.includes(option.id)
    && (!option.seriesId || option.seriesId === seriesId)
    && option.title.toLocaleLowerCase("hu").includes(search.toLocaleLowerCase("hu")));

  function changeKind(id: string, from: SeriesPartKind, to: SeriesPartKind) {
    if (from === to) return;
    setGroups((current) => ({ ...current, [from]: current[from].filter((partId) => partId !== id), [to]: [...current[to], id] }));
    setAnnouncement("A tanulmány az új csoport végére került. Mentsd el a változásokat.");
  }

  return (
    <fieldset className="field field--full series-editor-parts">
      <legend>A sorozat anyagai</legend>
      <p className="field-help">A két csoport külön rendezhető. A változások mentéskor lépnek életbe.</p>
      {(["lesson", "supplement"] as const).map((kind) => (
        <section key={kind} aria-labelledby={`series-group-${kind}`}>
          <h3 id={`series-group-${kind}`}>{kind === "lesson" ? "Leckék" : "Mellékletek"}</h3>
          <ol className="series-editor-list">
            {groups[kind].map((id, index) => {
              const part = options.find((option) => option.id === id);
              if (!part) return null;
              return <li key={id}>
                <input type="hidden" name={kind === "lesson" ? "partIds" : "supplementIds"} value={id} />
                <span className="series-part-number">{index + 1}.</span>
                <span className="series-editor-list__title">
                  <Link href={`/admin/tanulmanyok?edit=${id}`}>{part.title}</Link>
                  <small>{part.status === "draft" ? "Vázlat · csak a szerkesztőségben látható" : "Publikált"}</small>
                  <select aria-label={`${part.title}: típus`} value={kind} onChange={(event) => changeKind(id, kind, event.target.value as SeriesPartKind)}>
                    <option value="lesson">Lecke</option><option value="supplement">Melléklet</option>
                  </select>
                </span>
                <div className="series-editor-list__controls">
                  <button type="button" disabled={index === 0} aria-label={`${part.title}: feljebb`} onClick={() => {
                    setGroups((current) => ({ ...current, [kind]: moveSeriesPart(current[kind], id, -1) }));
                    setAnnouncement(`${part.title}: ${index}. hely.`);
                  }}>↑</button>
                  <button type="button" disabled={index === groups[kind].length - 1} aria-label={`${part.title}: lejjebb`} onClick={() => {
                    setGroups((current) => ({ ...current, [kind]: moveSeriesPart(current[kind], id, 1) }));
                    setAnnouncement(`${part.title}: ${index + 2}. hely.`);
                  }}>↓</button>
                  <button type="button" aria-label={`${part.title}: eltávolítás a sorozatból`} onClick={() => {
                    setGroups((current) => ({ ...current, [kind]: current[kind].filter((partId) => partId !== id) }));
                    setAnnouncement(`${part.title} kikerül a sorozatból a mentés után.`);
                  }}>×</button>
                </div>
              </li>;
            })}
          </ol>
          {!groups[kind].length ? <p className="field-help">{kind === "lesson" ? "Még nincs lecke." : "Még nincs melléklet."}</p> : null}
        </section>
      ))}
      <label htmlFor="series-study-search">Meglévő tanulmány keresése</label>
      <input id="series-study-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedId(""); }} placeholder="Keresés cím alapján" />
      <div className="series-editor-add">
        <label className="visually-hidden" htmlFor="series-study-option">Hozzáadható tanulmány</label>
        <select id="series-study-option" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">{available.length ? "Válassz tanulmányt…" : "Nincs hozzáadható találat"}</option>
          {available.map((part) => <option key={part.id} value={part.id}>{part.title}{part.status === "draft" ? " (vázlat)" : ""}</option>)}
        </select>
        <select aria-label="Hozzáadás típusa" value={selectedKind} onChange={(event) => setSelectedKind(event.target.value as SeriesPartKind)}>
          <option value="lesson">Lecke</option><option value="supplement">Melléklet</option>
        </select>
        <button type="button" className="button" disabled={!selectedId} onClick={() => {
          if (!selectedId || !available.some((part) => part.id === selectedId)) return;
          setGroups((current) => ({ ...current, [selectedKind]: [...current[selectedKind], selectedId] }));
          setSelectedId(""); setSearch("");
          setAnnouncement("A tanulmány a kiválasztott csoport végére került. Mentsd el a változásokat.");
        }}>Hozzáadás</button>
      </div>
      <p className="field-help">Az eltávolítás után a tanulmány megmarad. Másik sorozatból a tanulmány szerkesztőjében helyezhetsz át anyagot.</p>
      <span className="visually-hidden" role="status">{announcement}</span>
    </fieldset>
  );
}
