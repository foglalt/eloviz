import Link from "next/link";

type AdminIndexItem = {
  id: string;
  title: string;
  meta: string;
  status: "draft" | "published";
};

type Props = {
  basePath: string;
  heading: string;
  countLabel: string;
  searchId: string;
  search: string;
  selectedId?: string;
  page: number;
  pageCount: number;
  paginationLabel: string;
  items: AdminIndexItem[];
  emptyLabel: string;
};

function indexHref(basePath: string, edit: string | undefined, search: string, page: number) {
  const params = new URLSearchParams();
  if (edit) params.set("edit", edit);
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `${basePath}${suffix ? `?${suffix}` : ""}`;
}

export function AdminContentIndex({
  basePath,
  heading,
  countLabel,
  searchId,
  search,
  selectedId,
  page,
  pageCount,
  paginationLabel,
  items,
  emptyLabel,
}: Props) {
  return (
    <aside className="admin-panel admin-index-panel">
      <div className="admin-index-heading">
        <div><h2>{heading}</h2><small>{countLabel}</small></div>
        <Link className="admin-index-create" href={basePath}>+ Új</Link>
      </div>
      <form className="admin-index-search" action={basePath}>
        {selectedId ? <input type="hidden" name="edit" value={selectedId} /> : null}
        <label htmlFor={searchId}>Keresés</label>
        <div>
          <input id={searchId} name="q" type="search" defaultValue={search} placeholder="Cím vagy slug" />
          <button type="submit">Keresés</button>
        </div>
        {search ? <Link href={indexHref(basePath, selectedId, "", 1)}>Szűrés törlése</Link> : null}
      </form>
      <ul className="admin-list admin-index-list">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <li key={item.id} className={isSelected ? "is-selected" : undefined}>
              <Link
                className="admin-list-row"
                href={indexHref(basePath, item.id, search, page)}
                aria-current={isSelected ? "page" : undefined}
              >
                <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                <i className={`status${item.status === "draft" ? " status--draft" : ""}`}>
                  {item.status === "published" ? "élő" : "vázlat"}
                </i>
              </Link>
            </li>
          );
        })}
        {items.length === 0 ? <li className="admin-list-empty">{emptyLabel}</li> : null}
      </ul>
      {pageCount > 1 ? (
        <nav className="admin-index-pagination" aria-label={paginationLabel}>
          {page > 1 ? <Link href={indexHref(basePath, selectedId, search, page - 1)}>← Előző</Link> : <span />}
          <span>{page} / {pageCount}</span>
          {page < pageCount ? <Link href={indexHref(basePath, selectedId, search, page + 1)}>Következő →</Link> : <span />}
        </nav>
      ) : null}
    </aside>
  );
}
