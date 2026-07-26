import type { ReactNode } from "react";

type CommonRecord = {
  title?: string;
  slug?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: "draft" | "published";
  sortOrder?: number;
  featured?: boolean;
};

type Props = {
  record?: CommonRecord | null;
  featuredLabel: string;
  statusHelp?: string;
  showTitle?: boolean;
  children: ReactNode;
};

export function AdminContentFormFields({
  record,
  featuredLabel,
  statusHelp,
  showTitle = true,
  children,
}: Props) {
  return (
    <>
      {showTitle ? (
        <div className="field">
          <label htmlFor="title">Cím</label>
          <input id="title" name="title" defaultValue={record?.title} required />
        </div>
      ) : null}
      {record?.slug ? <input type="hidden" name="slug" value={record.slug} /> : null}
      {children}
      <div className="field">
        <label htmlFor="seoTitle">SEO-cím (max. 70)</label>
        <input id="seoTitle" name="seoTitle" defaultValue={record?.seoTitle ?? ""} maxLength={70} />
      </div>
      <div className="field">
        <label htmlFor="seoDescription">SEO-leírás (max. 170)</label>
        <textarea
          id="seoDescription"
          name="seoDescription"
          defaultValue={record?.seoDescription ?? ""}
          maxLength={170}
        />
      </div>
      <div className="field">
        <label htmlFor="status">Állapot</label>
        <select id="status" name="status" defaultValue={record?.status ?? "draft"}>
          <option value="draft">Vázlat</option>
          <option value="published">Publikált</option>
        </select>
        {statusHelp ? <small className="field-help">{statusHelp}</small> : null}
      </div>
      <div className="field">
        <label htmlFor="sortOrder">Sorrend</label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min="0"
          defaultValue={record?.sortOrder ?? 0}
        />
      </div>
      <label className="check-field field--full">
        <input name="featured" type="checkbox" defaultChecked={record?.featured} /> {featuredLabel}
      </label>
    </>
  );
}
