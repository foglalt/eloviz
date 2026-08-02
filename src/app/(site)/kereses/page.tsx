import type { Metadata } from "next";
import { CatalogSearchResults } from "@/components/catalog-search-results";
import { PublicSearchForm } from "@/components/public-search-form";
import { normalizeCatalogSearchKinds } from "@/lib/catalog-search";
import { searchPublicCatalog } from "@/lib/content-repository";
import {
  normalizeScriptureReferenceQuery,
  parseScriptureReferenceQuery,
} from "@/lib/scripture-references";

export const metadata: Metadata = {
  title: "Keresés",
  description: "Keresés az Élő Víz témái, bibliatanulmányai és videóajánlói között.",
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    tipus?: string | string[];
    ige?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q ?? "";
  const rawScriptureQuery = Array.isArray(params.ige) ? params.ige[0] : params.ige ?? "";
  const scriptureQuery = normalizeScriptureReferenceQuery(rawScriptureQuery);
  const scriptureFilter = scriptureQuery ? parseScriptureReferenceQuery(scriptureQuery) : null;
  const scriptureInvalid = Boolean(scriptureQuery) && !scriptureFilter;
  const selectedKinds = normalizeCatalogSearchKinds(params.tipus);
  const results = await searchPublicCatalog(rawQuery, selectedKinds, scriptureFilter);
  const textQuery = results.query.length >= 2 ? results.query : "";
  const hasValidQuery = Boolean(textQuery) || Boolean(scriptureFilter);
  const activeSearchLabel = textQuery && scriptureFilter
    ? `„${textQuery}”, igehely: ${scriptureFilter.displayLabel}`
    : textQuery
      ? `„${textQuery}”`
      : `igehely: ${scriptureFilter?.displayLabel ?? ""}`;

  return (
    <div className="page-shell search-page">
      <header className="page-intro search-page__intro">
        <p className="eyebrow">Központi keresés</p>
        <h1>Találd meg, amit keresel</h1>
        <p className="lead">
          Keress a közzétett témák, PDF-tanulmányok és videóajánlók között, akár egyszerre több tartalomtípusban.
        </p>
        <PublicSearchForm
          defaultKinds={selectedKinds}
          defaultScriptureValue={scriptureQuery}
          defaultValue={results.query}
          key={`${selectedKinds.join("-")}-${scriptureQuery}`}
          scriptureInvalid={scriptureInvalid}
          variant="page"
        />
      </header>

      {scriptureInvalid ? (
        <div className="search-guidance search-guidance--empty">
          <p>Nem ismertük fel ezt az igehelyet: „{scriptureQuery}”</p>
          <span>Használd például ezt a formátumot: Jn 3:16 vagy Jn 3:1-8.</span>
        </div>
      ) : !hasValidQuery ? (
        <div className="search-guidance">
          <p>Írj be legalább két karaktert, vagy adj meg egy igehelyet.</p>
          <span>Például: szövetség, húsvét vagy Jn 3:16-18</span>
        </div>
      ) : results.total === 0 ? (
        <div className="search-guidance search-guidance--empty">
          <p>Nincs találat erre: {activeSearchLabel}</p>
          <span>Próbálj rövidebb vagy általánosabb kifejezést.</span>
        </div>
      ) : (
        <div className="search-results">
          <p className="search-results__summary">
            <strong>{results.total} találat</strong> erre: {activeSearchLabel}
          </p>
          <CatalogSearchResults heading="Témák" items={results.topics} />
          <CatalogSearchResults heading="Tanulmányok" items={results.studies} />
          <CatalogSearchResults heading="Videók" items={results.videos} />
        </div>
      )}
    </div>
  );
}
