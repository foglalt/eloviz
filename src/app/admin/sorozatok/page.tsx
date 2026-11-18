import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminContentIndex } from "@/components/admin-content-index";
import { AdminEditorPanel } from "@/components/admin-editor-panel";
import { AdminFormSubmit } from "@/components/admin-form-submit";
import { AdminSeriesParts } from "@/components/admin-series-parts";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminSeries, listSeriesStudyOptions } from "@/lib/study-series-repository";
import { saveStudySeriesAction } from "../actions";
import { seriesCountLabel, seriesPartGroups } from '@/lib/study-series-core';

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ edit?: string; q?: string; page?: string; message?: string; error?: string }> };

export default async function AdminSeriesPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const [series, studyOptions] = await Promise.all([listAdminSeries(), listSeriesStudyOptions()]);
  const selected = series.find((item) => item.id === query.edit);
  const selectedGroups = seriesPartGroups(selected?.parts ?? []);
  const search = query.q?.trim().slice(0, 120) ?? "";
  const filtered = series.filter((item) => `${item.title} ${item.author}`.toLocaleLowerCase("hu").includes(search.toLocaleLowerCase("hu")));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 30));
  const page = Math.min(pageCount, Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1));
  return (
    <AdminContentWorkspace eyebrow="Fejezetről fejezetre" title="Tanulmánysorozatok" message={query.message} error={query.error} successKey={selected ? `${selected.id}:${selected.revision}` : undefined} index={(
      <AdminContentIndex basePath="/admin/sorozatok" heading="Sorozatok" countLabel={`${filtered.length} sorozat`} searchId="series-search" search={search}
        selectedId={selected?.id} page={page} pageCount={pageCount} paginationLabel="Sorozatlista lapozása"
        items={filtered.slice((page - 1) * 30, page * 30).map((item) => ({ id: item.id, title: item.title, status: item.status, meta: `${seriesCountLabel(item.parts)}${item.author ? ` · ${item.author}` : ""}` }))}
        emptyLabel="Még nincs ilyen sorozat." />
    )}>
      <AdminEditorPanel title={selected ? "Sorozat szerkesztése" : "Új sorozat"} help="A leckéket és a mellékleteket külön PDF-tanulmányokként töltheted fel, és csoportonként rendezheted. A nyilvános tartalomjegyzékben a publikált, olvasható anyagok jelennek meg.">
        <form key={selected ? `${selected.id}:${selected.revision}` : "new"} action={saveStudySeriesAction} className="form-grid">
          {selected ? <><input type="hidden" name="id" value={selected.id} /><input type="hidden" name="slug" value={selected.slug} /><input type="hidden" name="expectedUpdatedAt" value={selected.revision} /></> : null}
          <div className="field field--full"><label htmlFor="title">Sorozat címe</label><input id="title" name="title" required minLength={2} maxLength={160} defaultValue={selected?.title} /></div>
          <div className="field field--full"><label htmlFor="description">A sorozat bemutatása</label><textarea id="description" name="description" required minLength={30} maxLength={3000} defaultValue={selected?.description} /></div>
          <div className="field"><label htmlFor="author">Szerző (nem kötelező)</label><input id="author" name="author" maxLength={160} defaultValue={selected?.author} /></div>
          <div className="field"><label htmlFor="sourceUrl">Eredeti forrás (nem kötelező)</label><input id="sourceUrl" name="sourceUrl" type="url" defaultValue={selected?.sourceUrl} placeholder="https://sumtv.org/…" /></div>
          <AdminSeriesParts seriesId={selected?.id} options={studyOptions.map((part) => ({ id: part.id, title: part.title, status: part.status, seriesId: part.seriesId }))} initialIds={selectedGroups.lessons.map((part) => part.id)} initialSupplementIds={selectedGroups.supplements.map((part) => part.id)} />
          <div className="field field--full">
            <label htmlFor="status">Állapot</label>
            <label className="status-switch" htmlFor="status"><input id="status" className="status-switch__control" type="checkbox" role="switch" name="status" value="published" defaultChecked={selected?.status === "published"} aria-label="Sorozat publikálási állapota" /><span className="status-switch__track" aria-hidden="true" /><span className="status-switch__text" aria-hidden="true"><span className="status-switch__draft">Vázlat</span><span className="status-switch__published">Publikált</span></span></label>
            <input type="hidden" name="status" value="draft" />
            <small className="field-help">A sorozat akkor válik nyilvánosan elérhetővé, ha publikált, és legalább egy része olvasható.</small>
          </div>
          <div className="form-actions field--full"><AdminFormSubmit label="Sorozat mentése" enableSaveShortcut /></div>
        </form>
      </AdminEditorPanel>
      {selected ? <section className="admin-panel"><h2>Új anyag</h2><p>A kiválasztott csoport következő sorszámát és az előző anyag témáit előkészítjük.</p><div className="form-actions"><Link className="button" href={`/admin/tanulmanyok?series=${selected.id}&kind=lesson`}>+ Új lecke</Link><Link className="button button--secondary" href={`/admin/tanulmanyok?series=${selected.id}&kind=supplement`}>+ Új melléklet</Link></div>{selected.status === "published" && selected.parts.some((part) => part.status === "published" && part.hasPublishedDocument) ? <p><Link className="text-link" href={`/sorozatok/${selected.slug}`} target="_blank">Nyilvános sorozat megnyitása</Link></p> : null}</section> : null}
    </AdminContentWorkspace>
  );
}
