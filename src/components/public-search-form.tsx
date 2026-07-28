"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  catalogSearchKindsForPathname,
  CATALOG_SEARCH_KINDS,
  type CatalogSearchKind,
} from "@/lib/catalog-search";

type PublicSearchFormProps = {
  defaultValue?: string;
  defaultKinds?: readonly CatalogSearchKind[];
  variant?: "header" | "page";
};

export function PublicSearchForm({
  defaultValue = "",
  defaultKinds,
  variant = "header",
}: PublicSearchFormProps) {
  const isPageSearch = variant === "page";
  const routeKinds = catalogSearchKindsForPathname(usePathname());
  const [selectedKinds, setSelectedKinds] = useState<CatalogSearchKind[]>([
    ...(defaultKinds ?? CATALOG_SEARCH_KINDS),
  ]);
  const activeKinds = isPageSearch ? selectedKinds : routeKinds;

  function toggleKind(kind: CatalogSearchKind) {
    setSelectedKinds((current) => {
      if (!current.includes(kind)) {
        return CATALOG_SEARCH_KINDS.filter((candidate) => (
          candidate === kind || current.includes(candidate)
        ));
      }
      return current.length === 1 ? current : current.filter((candidate) => candidate !== kind);
    });
  }

  return (
    <form
      action="/kereses"
      className={`public-search public-search--${variant}`}
      role="search"
    >
      <label className="public-search__query">
        <span className="visually-hidden">Keresés a témák, tanulmányok és videók között</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          defaultValue={defaultValue}
          enterKeyHint="search"
          maxLength={100}
          minLength={2}
          name="q"
          placeholder={isPageSearch ? "Mit keresel?" : "Keresés…"}
          type="search"
        />
      </label>
      <button aria-label={isPageSearch ? undefined : "Keresés"} type="submit">
        {isPageSearch ? "Keresés" : (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="m9 6 6 6-6 6" />
          </svg>
        )}
      </button>
      {isPageSearch ? (
        <fieldset className="public-search__filters">
          <legend>Hol keressünk?</legend>
          <label>
            <input
              checked={selectedKinds.includes("topic")}
              name="tipus"
              onChange={() => toggleKind("topic")}
              type="checkbox"
              value="topic"
            />
            Témák
          </label>
          <label>
            <input
              checked={selectedKinds.includes("study")}
              name="tipus"
              onChange={() => toggleKind("study")}
              type="checkbox"
              value="study"
            />
            Tanulmányok
          </label>
          <label>
            <input
              checked={selectedKinds.includes("video")}
              name="tipus"
              onChange={() => toggleKind("video")}
              type="checkbox"
              value="video"
            />
            Videók
          </label>
        </fieldset>
      ) : activeKinds.map((kind) => (
        <input key={kind} name="tipus" type="hidden" value={kind} />
      ))}
    </form>
  );
}
