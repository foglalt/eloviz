import Link from "next/link";
import type { CatalogSearchItem, CatalogSearchKind } from "@/lib/catalog-search";

const resultLabels: Record<CatalogSearchKind, string> = {
  topic: "Téma",
  study: "PDF-tanulmány",
  video: "Videóajánló",
};

const resultPaths: Record<CatalogSearchKind, string> = {
  topic: "/temak",
  study: "/tanulmanyok",
  video: "/videok",
};

type SearchResultGroupProps = {
  heading: string;
  items: CatalogSearchItem[];
};

export function CatalogSearchResults({ heading, items }: SearchResultGroupProps) {
  if (!items.length) return null;

  return (
    <section className="search-result-group">
      <div className="search-result-group__heading">
        <h2>{heading}</h2>
        <span>{items.length} találat</span>
      </div>
      <div className="search-result-list">
        {items.map((item) => (
          <Link
            className="search-result"
            href={`${resultPaths[item.kind]}/${item.slug}`}
            key={`${item.kind}:${item.id}`}
          >
            <span>
              <span className="eyebrow">{resultLabels[item.kind]}</span>
              <span className="search-result__title">{item.title}</span>
              {item.meta ? <span className="search-result__meta">{item.meta}</span> : null}
            </span>
            <span className="search-result__description">{item.description}</span>
            <span aria-hidden="true" className="search-result__arrow">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
