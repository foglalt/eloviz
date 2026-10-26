import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminContentFormFields } from "@/components/admin-content-form-fields";
import { AdminContentIndex } from "@/components/admin-content-index";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminDeletePanel } from "@/components/admin-delete-panel";
import { AdminEditorPanel } from "@/components/admin-editor-panel";
import { AdminStudyForm, AdminInitialStudyPdf } from "@/components/admin-study-form";
import { AdminFormSubmit } from "@/components/admin-form-submit";
import { AdminRelationPicker } from "@/components/admin-relation-picker";
import { AdminStudySeriesFields } from "@/components/admin-study-series-fields";
import { getSeriesDefaultTopicIds, listAdminSeries } from "@/lib/study-series-repository";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminStudy,
  listAdminStudyIndex,
  listAdminTopicOptions,
  listAdminVideoOptions,
} from "@/lib/content-repository";
import {
  deleteStudyDocumentAction,
  uploadStudyPdfAction,
} from "../actions";

type Props = {
  searchParams: Promise<{
    edit?: string;
    message?: string;
    error?: string;
    q?: string;
    page?: string;
    series?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AdminStudiesPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 120) ?? "";
  const requestedPage = Number.parseInt(query.page ?? "1", 10) || 1;
  const [studyIndex, selected, topics, series, videos] = await Promise.all([
    listAdminStudyIndex(search, requestedPage),
    query.edit ? getAdminStudy(query.edit) : Promise.resolve(null),
    listAdminTopicOptions(),
    listAdminSeries(),
    listAdminVideoOptions(),
  ]);
  const newSeries = !selected ? series.find((item) => item.id === query.series) : undefined;
  const defaultTopicIds = newSeries ? await getSeriesDefaultTopicIds(newSeries.id) : [];
  const indexItems = studyIndex.items.map((study) => {
    const documentState = study.documentCount === 0
      ? "nincs PDF"
      : study.hasPublishedDocument
        ? "véglegesítve"
        : "nincs használható PDF";

    return {
      id: study.id,
      title: study.title,
      meta: `${study.documentCount} PDF · ${documentState}`,
      status: study.status,
    };
  });

  return (
    <AdminContentWorkspace
      eyebrow="PDF-könyvtár"
      title="Tanulmányok"
      message={query.message}
      error={query.error}
      successKey={selected ? `${selected.id}:${selected.updatedAt}` : undefined}
      index={(
        <AdminContentIndex
          basePath="/admin/tanulmanyok"
          heading="Tanulmányok"
          countLabel={`${studyIndex.total} anyag`}
          searchId="study-search"
          search={search}
          selectedId={selected?.id}
          page={studyIndex.page}
          pageCount={studyIndex.pageCount}
          paginationLabel="Tanulmánylista lapozása"
          items={indexItems}
          emptyLabel="Nincs találat."
        />
      )}
    >
      <AdminEditorPanel
        title={selected ? "Tanulmány szerkesztése" : "Új tanulmány"}
        help={selected ? "Módosítsd az adatokat, vagy tölts fel új PDF-verziót lentebb." : "Add meg az adatokat és válaszd ki a PDF-et, majd mentsd el együtt. A PDF-ből automatikusan elkészül az olvasási nézet és felismerjük az igehelyeket. PDF nélkül vázlatot menthetsz."}
      >
        <AdminStudyForm
          key={selected ? `${selected.id}:${selected.updatedAt ?? ""}` : `new:${newSeries?.id ?? ""}`}
        >
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <AdminContentFormFields
            record={selected}
            featuredLabel="Kiemelt tanulmány"
            statusHelp="Véglegesített PDF nélkül a tanulmány mentéskor automatikusan vázlat marad."
          >
            <div className="field field--full">
              <label htmlFor="summary">Összefoglaló</label>
              <textarea id="summary" name="summary" defaultValue={selected?.summary} minLength={30} maxLength={1500} required />
            </div>
            {!selected ? <AdminInitialStudyPdf /> : null}
            <AdminStudySeriesFields
              options={series.map((item) => ({ id: item.id, title: item.title, nextPosition: item.parts.length + 1 }))}
              initialSeriesId={selected?.seriesId ?? newSeries?.id}
              initialPosition={selected?.seriesPosition ?? (newSeries ? newSeries.parts.length + 1 : 1)}
            />
            {(selected?.relatedStudyIds ?? []).map((id) => <input key={id} type="hidden" name="relatedStudyIds" value={id} />)}
            <div className="relation-fields field--full">
              <fieldset className="field relation-field">
                <legend>
                  Témák
                  <span className="relation-info">
                    <button
                      type="button"
                      className="relation-info__button"
                      aria-label="Információ a témák kiválasztásáról"
                      aria-describedby="study-topics-help"
                    >
                      i
                    </button>
                    <span
                      id="study-topics-help"
                      className="relation-info__tooltip"
                      role="tooltip"
                    >
                      Üresen hagyva az Egyéb témakörbe kerül.
                    </span>
                  </span>
                </legend>
                <AdminRelationPicker
                  key={`topics-${selected?.id ?? "new"}`}
                  name="topicIds"
                  options={topics.map((topic) => ({
                    id: topic.id,
                    label: topic.title,
                  }))}
                  selectedIds={selected?.topics.map((item) => item.id) ?? defaultTopicIds}
                  searchLabel="Témák szűrése"
                  emptyLabel="Nincs ilyen téma."
                />
              </fieldset>
              <fieldset className="field relation-field">
                <legend>Kapcsolódó videók</legend>
                <AdminRelationPicker
                  key={`videos-${selected?.id ?? "new"}`}
                  name="relatedVideoIds"
                  options={videos.map((video) => ({
                    id: video.id,
                    label: video.title,
                  }))}
                  selectedIds={selected?.relatedVideoIds}
                  searchLabel="Videók szűrése"
                  emptyLabel="Nincs ilyen videó."
                />
              </fieldset>
            </div>
          </AdminContentFormFields>
          <div className="form-actions field--full">
            <AdminFormSubmit label={selected ? "Adatok mentése" : "Tanulmány létrehozása"} pendingLabel="Tanulmány mentése és feldolgozása…" enableSaveShortcut />
            {selected?.seriesId ? <Link className="text-link" href={`/admin/tanulmanyok?series=${selected.seriesId}`}>+ Következő rész létrehozása</Link> : null}
          </div>
        </AdminStudyForm>
      </AdminEditorPanel>

      {selected ? (
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p className="eyebrow">PDF-verziók</p><h2>PDF feltöltése</h2></div>
            <span>Legfeljebb 12 MB</span>
          </div>
          <form action={uploadStudyPdfAction} className="upload-form">
            <input type="hidden" name="studyId" value={selected.id} />
            <input name="pdf" type="file" accept="application/pdf,.pdf" required />
            <AdminFormSubmit
              label="Feltöltés és feldolgozás"
              pendingLabel="A PDF feltöltése és feldolgozása…"
              className="button"
            />
          </form>
          {selected.documents.length > 0 ? (
            <ol className="document-history">
              {selected.documents.map((document) => {
                const isPublishedDocument = selected.publishedDocumentId === document.id;
                return (
                  <li key={document.id}>
                    <div className="document-history__meta">
                      <strong>v{document.versionNumber} · {document.originalFilename}</strong>
                      <span>
                        {Math.round(document.byteSize / 1024)} kB ·{" "}
                        {document.extractionStatus === "complete"
                          ? `${document.candidates.length} igehely · ${document.articleAvailable ? "HTML nézet elkészült · " : ""}automatikusan véglegesítve`
                          : "feldolgozás sikertelen"}
                        {isPublishedDocument ? " · jelenlegi PDF" : ""}
                      </span>
                    </div>
                    <div className="document-history__actions">
                      <Link
                        className="document-link"
                        href={`/api/documents/${document.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF megnyitása ↗
                      </Link>
                      {isPublishedDocument && selected.status === "published" ? (
                        <small className="document-protected">
                          Eltávolításkor a tanulmány automatikusan vázlatra kerül.
                        </small>
                      ) : null}
                      <form action={deleteStudyDocumentAction} className="document-delete">
                        <input type="hidden" name="studyId" value={selected.id} />
                        <input type="hidden" name="documentId" value={document.id} />
                        <label>
                          <input type="checkbox" name="confirmed" required /> Törlés megerősítése
                        </label>
                        <button className="admin-link-button admin-link-button--danger" type="submit">
                          Eltávolítás
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </section>
      ) : null}

      {selected ? <AdminDeletePanel entity="study" id={selected.id} title={selected.title} /> : null}
    </AdminContentWorkspace>
  );
}
