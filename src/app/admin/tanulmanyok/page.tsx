import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminContentFormFields } from "@/components/admin-content-form-fields";
import { AdminContentIndex } from "@/components/admin-content-index";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminDeletePanel } from "@/components/admin-delete-panel";
import { AdminEditorPanel } from "@/components/admin-editor-panel";
import { AdminRelationPicker } from "@/components/admin-relation-picker";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminStudy,
  listAdminStudyIndex,
  listAdminTopicOptions,
  listAdminVideoOptions,
} from "@/lib/content-repository";
import {
  deleteStudyDocumentAction,
  finalizeStudyReferencesAction,
  saveStudyAction,
  uploadStudyPdfAction,
} from "../actions";

type Props = {
  searchParams: Promise<{
    edit?: string;
    message?: string;
    error?: string;
    q?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

function referenceLine(reference: { label: string; osisStart: string; osisEnd: string }) {
  return `${reference.label} | ${reference.osisStart}${reference.osisEnd !== reference.osisStart ? `-${reference.osisEnd}` : ""}`;
}

export default async function AdminStudiesPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 120) ?? "";
  const requestedPage = Number.parseInt(query.page ?? "1", 10) || 1;
  const [studyIndex, selected, topics, videos] = await Promise.all([
    listAdminStudyIndex(search, requestedPage),
    query.edit ? getAdminStudy(query.edit) : Promise.resolve(null),
    listAdminTopicOptions(),
    listAdminVideoOptions(),
  ]);
  const reviewDocument = selected?.documents[0];
  const proposedLines = reviewDocument?.candidates.length
    ? reviewDocument.candidates.map(referenceLine)
    : selected?.references.map(referenceLine) ?? [];
  const indexItems = studyIndex.items.map((study) => {
    const documentState = study.documentCount === 0
      ? "nincs PDF"
      : study.hasPendingDocument
        ? "ellenőrzésre vár"
        : study.hasPublishedDocument
          ? "véglegesítve"
          : "PDF feltöltve";

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
        help="Először mentsd a vázlatot. Ezután tölthetsz fel hozzá PDF-et és ellenőrizheted az automatikusan talált igehelyeket."
      >
        <form
          key={selected ? `${selected.id}:${selected.updatedAt ?? ""}` : "new"}
          action={saveStudyAction}
          className="form-grid"
        >
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <AdminContentFormFields
            record={selected}
            featuredLabel="Kiemelt tanulmány"
            statusHelp="Véglegesített PDF nélkül a tanulmány mentéskor automatikusan vázlat marad."
          >
            <div className="field field--full">
              <label htmlFor="summary">Összefoglaló</label>
              <textarea id="summary" name="summary" defaultValue={selected?.summary} required />
            </div>
            <fieldset className="field field--full">
              <legend>Témák</legend>
              <small className="field-help">
                Ha nem választasz témát, a tanulmány nyilvánosan az Egyéb témakörbe kerül.
              </small>
              <AdminRelationPicker
                key={`topics-${selected?.id ?? "new"}`}
                name="topicIds"
                options={topics.map((topic) => ({
                  id: topic.id,
                  label: topic.title,
                  meta: topic.status === "published" ? "élő" : "vázlat",
                }))}
                selectedIds={selected?.topics.map((item) => item.id)}
                searchLabel="Témák szűrése"
                emptyLabel="Nincs ilyen téma."
              />
            </fieldset>
            <fieldset className="field field--full">
              <legend>Kapcsolódó videók</legend>
              <AdminRelationPicker
                key={`videos-${selected?.id ?? "new"}`}
                name="relatedVideoIds"
                options={videos.map((video) => ({
                  id: video.id,
                  label: video.title,
                  meta: video.status === "published" ? "élő" : "vázlat",
                }))}
                selectedIds={selected?.relatedVideoIds}
                searchLabel="Videók szűrése"
                emptyLabel="Nincs ilyen videó."
              />
            </fieldset>
          </AdminContentFormFields>
          <div className="form-actions field--full">
            <button className="button button--primary" type="submit">Adatok mentése</button>
          </div>
        </form>
      </AdminEditorPanel>

      {selected ? (
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p className="eyebrow">2. lépés</p><h2>PDF feltöltése</h2></div>
            <span>Legfeljebb 12 MB</span>
          </div>
          <form action={uploadStudyPdfAction} className="upload-form">
            <input type="hidden" name="studyId" value={selected.id} />
            <input name="pdf" type="file" accept="application/pdf,.pdf" required />
            <button className="button" type="submit">Feltöltés és elemzés</button>
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
                          ? "szöveg kiolvasva"
                          : "kézi ellenőrzés szükséges"}
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

      {selected && reviewDocument ? (
        <section className="admin-panel">
          <p className="eyebrow">3. lépés</p>
          <h2>Talált igehelyek ellenőrzése</h2>
          <p className="admin-help">
            Egy sor egy hivatkozás. Formátum:{" "}
            <code>Megjelenő név | OSIS-kezdőpont-OSIS-végpont</code>. Példa:{" "}
            <code>Jn 3:16 | John.3.16</code>.
          </p>
          {reviewDocument.extractionError ? (
            <p className="admin-notice admin-notice--error">{reviewDocument.extractionError}</p>
          ) : null}
          {reviewDocument.candidates.length > 0 ? (
            <details className="candidate-evidence" open>
              <summary>
                {reviewDocument.candidates.length} automatikus találat és szövegkörnyezete
              </summary>
              <ol>
                {reviewDocument.candidates.map((candidate) => (
                  <li key={candidate.id}>
                    <strong>{candidate.label}</strong>
                    <span>
                      {candidate.pageNumber ? `${candidate.pageNumber}. oldal` : "oldalszám nélkül"} ·{" "}
                      {candidate.contextSnippet}
                    </span>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
          <form action={finalizeStudyReferencesAction} className="form-grid">
            <input type="hidden" name="studyId" value={selected.id} />
            <input type="hidden" name="documentId" value={reviewDocument.id} />
            <div className="field field--full">
              <label htmlFor="references">Végleges igehelylista</label>
              <textarea
                id="references"
                name="references"
                className="reference-editor"
                defaultValue={proposedLines.join("\n")}
              />
            </div>
            <label className="check-field field--full">
              <input name="confirmed" type="checkbox" required /> Ellenőriztem a listát, a hiányzó
              vagy hibás hivatkozásokat javítottam.
            </label>
            <label className="check-field field--full">
              <input name="publishNow" type="checkbox" /> A véglegesítés után legyen azonnal
              publikált
            </label>
            <div className="form-actions field--full">
              <button className="button button--primary" type="submit">
                Igehelyek és PDF-verzió véglegesítése
              </button>
            </div>
          </form>
        </section>
      ) : null}
      {selected ? <AdminDeletePanel entity="study" id={selected.id} title={selected.title} /> : null}
    </AdminContentWorkspace>
  );
}
