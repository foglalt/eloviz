import type { Metadata } from "next";
import { CatalogSearchResults } from "@/components/catalog-search-results";
import { PublicSearchForm } from "@/components/public-search-form";
import { searchPublicCatalog } from "@/lib/content-repository";

export const metadata: Metadata = {
  title: "Keresés",
  description: "Keresés az Élő Víz témái, bibliatanulmányai és videóajánlói között.",
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q ?? "";
  const results = await searchPublicCatalog(rawQuery);
  const hasValidQuery = results.query.length >= 2;

  return (
    <div className="page-shell search-page">
      <header className="page-intro search-page__intro">
        <p className="eyebrow">Központi keresés</p>
        <h1>Találd meg, amit keresel</h1>
        <p className="lead">
          Keress egyszerre a közzétett témák, PDF-tanulmányok és videóajánlók között.
        </p>
        <PublicSearchForm defaultValue={results.query} variant="page" />
      </header>

      {!hasValidQuery ? (
        <div className="search-guidance">
          <p>Írj be legalább két karaktert a kereséshez.</p>
          <span>Például: szövetség, húsvét, Szentlélek</span>
        </div>
      ) : results.total === 0 ? (
        <div className="search-guidance search-guidance--empty">
          <p>Nincs találat erre: „{results.query}”</p>
          <span>Próbálj rövidebb vagy általánosabb kifejezést.</span>
        </div>
      ) : (
        <div className="search-results">
          <p className="search-results__summary">
            <strong>{results.total} találat</strong> erre: „{results.query}”
          </p>
          <CatalogSearchResults heading="Témák" items={results.topics} />
          <CatalogSearchResults heading="Tanulmányok" items={results.studies} />
          <CatalogSearchResults heading="Videók" items={results.videos} />
        </div>
      )}
    </div>
  );
}
