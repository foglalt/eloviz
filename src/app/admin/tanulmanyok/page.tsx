import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminRelationPicker } from "@/components/admin-relation-picker";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminStudy, listAdminStudyIndex, listAdminTopics, listAdminVideos } from "@/lib/content-repository";
import { deleteContentAction, deleteStudyDocumentAction, finalizeStudyReferencesAction, saveStudyAction, uploadStudyPdfAction } from "../actions";

type Props = { searchParams: Promise<{ edit?: string; message?: string; error?: string; q?: string; page?: string }> };
export const dynamic = "force-dynamic";

function referenceLine(reference: { label: string; osisStart: string; osisEnd: string }) {
  return `${reference.label} | ${reference.osisStart}${reference.osisEnd !== reference.osisStart ? `-${reference.osisEnd}` : ""}`;
}

function indexHref(edit: string | undefined, search: string, page: number) {
  const params = new URLSearchParams();
  if (edit) params.set("edit", edit);
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/admin/tanulmanyok${suffix ? `?${suffix}` : ""}`;
}

export default async function AdminStudiesPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 120) ?? "";
  const requestedPage = Number.parseInt(query.page ?? "1", 10) || 1;
  const [studyIndex, selected, topics, videos] = await Promise.all([
    listAdminStudyIndex(search, requestedPage),
    query.edit ? getAdminStudy(query.edit) : Promise.resolve(null),
    listAdminTopics(),
    listAdminVideos(),
  ]);
  const reviewDocument = selected?.documents[0];
  const proposedLines = reviewDocument?.candidates.length
    ? reviewDocument.candidates.map(referenceLine)
    : selected?.references.map(referenceLine) ?? [];

  return (
    <AdminShell>
      <div className="admin-heading"><div><p className="eyebrow">PDF-könyvtár</p><h1>Tanulmányok</h1></div></div>
      <AdminNotice message={query.message} error={query.error} />
      <div className="admin-grid">
        <aside className="admin-panel admin-index-panel">
          <div className="admin-index-heading">
            <div><h2>Tanulmányok</h2><small>{studyIndex.total} anyag</small></div>
            <Link className="admin-index-create" href="/admin/tanulmanyok">+ Új</Link>
          </div>
          <form className="admin-index-search" action="/admin/tanulmanyok">
            {selected ? <input type="hidden" name="edit" value={selected.id} /> : null}
            <label htmlFor="study-search">Keresés</label>
            <div><input id="study-search" name="q" type="search" defaultValue={search} placeholder="Cím vagy slug" /><button type="submit">Keresés</button></div>
            {search ? <Link href={indexHref(selected?.id, "", 1)}>Szűrés törlése</Link> : null}
          </form>
          <ul className="admin-list admin-study-list">
            {studyIndex.items.map((study) => {
              const isSelected = selected?.id === study.id;
              const documentState = study.documentCount === 0
                ? "nincs PDF"
                : study.hasPendingDocument
                  ? "ellenőrzésre vár"
                  : study.hasPublishedDocument
                    ? "véglegesítve"
                    : "PDF feltöltve";
              return <li key={study.id} className={isSelected ? "is-selected" : undefined}>
                <Link className="admin-list-row" href={indexHref(study.id, search, studyIndex.page)} aria-current={isSelected ? "page" : undefined}>
                  <span><strong>{study.title}</strong><small>{study.documentCount} PDF · {documentState}</small></span>
                  <i className={`status${study.status === "draft" ? " status--draft" : ""}`}>{study.status === "published" ? "élő" : "vázlat"}</i>
                </Link>
              </li>;
            })}
            {studyIndex.items.length === 0 ? <li className="admin-list-empty">Nincs találat.</li> : null}
          </ul>
          {studyIndex.pageCount > 1 ? <nav className="admin-index-pagination" aria-label="Tanulmánylista lapozása">
            {studyIndex.page > 1 ? <Link href={indexHref(selected?.id, search, studyIndex.page - 1)}>← Előző</Link> : <span />}
            <span>{studyIndex.page} / {studyIndex.pageCount}</span>
            {studyIndex.page < studyIndex.pageCount ? <Link href={indexHref(selected?.id, search, studyIndex.page + 1)}>Következő →</Link> : <span />}
          </nav> : null}
        </aside>
        <div className="admin-stack">
          <section className="admin-panel">
            <h2>{selected ? "Tanulmány szerkesztése" : "Új tanulmány"}</h2>
            <p className="admin-help">Először mentsd a vázlatot. Ezután tölthetsz fel hozzá PDF-et és ellenőrizheted az automatikusan talált igehelyeket.</p>
            <form key={selected ? `${selected.id}:${selected.updatedAt ?? ""}` : "new"} action={saveStudyAction} className="form-grid">
              {selected && <input type="hidden" name="id" value={selected.id} />}
              <div className="field"><label htmlFor="title">Cím</label><input id="title" name="title" defaultValue={selected?.title} required /></div>
              <div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" defaultValue={selected?.slug} placeholder="automatikus-a-cimbol" /></div>
              <div className="field field--full"><label htmlFor="summary">Összefoglaló</label><textarea id="summary" name="summary" defaultValue={selected?.summary} required /></div>
              <fieldset className="field field--full"><legend>Témák</legend><AdminRelationPicker key={`topics-${selected?.id ?? "new"}`} name="topicIds" options={topics.map((topic) => ({ id: topic.id, label: topic.title, meta: topic.status === "published" ? "élő" : "vázlat" }))} selectedIds={selected?.topics.map((item) => item.id)} searchLabel="Témák szűrése" emptyLabel="Nincs ilyen téma." /></fieldset>
              <fieldset className="field field--full"><legend>Kapcsolódó videók</legend><AdminRelationPicker key={`videos-${selected?.id ?? "new"}`} name="relatedVideoIds" options={videos.map((video) => ({ id: video.id, label: video.title, meta: video.status === "published" ? "élő" : "vázlat" }))} selectedIds={selected?.relatedVideoIds} searchLabel="Videók szűrése" emptyLabel="Nincs ilyen videó." /></fieldset>
              <div className="field"><label htmlFor="seoTitle">SEO-cím</label><input id="seoTitle" name="seoTitle" defaultValue={selected?.seoTitle} maxLength={70} /></div>
              <div className="field"><label htmlFor="seoDescription">SEO-leírás</label><textarea id="seoDescription" name="seoDescription" defaultValue={selected?.seoDescription} maxLength={170} /></div>
              <div className="field"><label htmlFor="status">Állapot</label><select id="status" name="status" defaultValue={selected?.status ?? "draft"}><option value="draft">Vázlat</option><option value="published">Publikált</option></select><small className="field-help">Véglegesített PDF nélkül a tanulmány mentéskor automatikusan vázlat marad.</small></div>
              <div className="field"><label htmlFor="sortOrder">Sorrend</label><input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue={selected?.sortOrder ?? 0} /></div>
              <label className="check-field field--full"><input name="featured" type="checkbox" defaultChecked={selected?.featured} /> Kiemelt tanulmány</label>
              <div className="form-actions field--full"><button className="button button--primary" type="submit">Adatok mentése</button></div>
            </form>
          </section>

          {selected && <section className="admin-panel">
            <div className="admin-panel__heading"><div><p className="eyebrow">2. lépés</p><h2>PDF feltöltése</h2></div><span>Legfeljebb 12 MB</span></div>
            <form action={uploadStudyPdfAction} className="upload-form">
              <input type="hidden" name="studyId" value={selected.id} />
              <input name="pdf" type="file" accept="application/pdf,.pdf" required />
              <button className="button" type="submit">Feltöltés és elemzés</button>
            </form>
            {selected.documents.length > 0 && <ol className="document-history">{selected.documents.map((document) => {
              const isPublishedDocument = selected.publishedDocumentId === document.id;
              return <li key={document.id}>
                <div className="document-history__meta">
                  <strong>v{document.versionNumber} · {document.originalFilename}</strong>
                  <span>{Math.round(document.byteSize / 1024)} kB · {document.extractionStatus === "complete" ? "szöveg kiolvasva" : "kézi ellenőrzés szükséges"}{isPublishedDocument ? " · jelenlegi PDF" : ""}</span>
                </div>
                <div className="document-history__actions">
                  <Link className="document-link" href={`/api/documents/${document.id}`} target="_blank" rel="noreferrer">PDF megnyitása ↗</Link>
                  {isPublishedDocument && selected.status === "published"
                    ? <small className="document-protected">Eltávolításkor a tanulmány automatikusan vázlatra kerül.</small>
                    : null}
                  <form action={deleteStudyDocumentAction} className="document-delete">
                    <input type="hidden" name="studyId" value={selected.id} />
                    <input type="hidden" name="documentId" value={document.id} />
                    <label><input type="checkbox" name="confirmed" required /> Törlés megerősítése</label>
                    <button className="admin-link-button admin-link-button--danger" type="submit">Eltávolítás</button>
                  </form>
                </div>
              </li>;
            })}</ol>}
          </section>}

          {selected && reviewDocument && <section className="admin-panel">
            <p className="eyebrow">3. lépés</p><h2>Talált igehelyek ellenőrzése</h2>
            <p className="admin-help">Egy sor egy hivatkozás. Formátum: <code>Megjelenő név | OSIS-kezdőpont-OSIS-végpont</code>. Példa: <code>Jn 3:16 | John.3.16</code>.</p>
            {reviewDocument.extractionError && <p className="admin-notice admin-notice--error">{reviewDocument.extractionError}</p>}
            {reviewDocument.candidates.length > 0 && <details className="candidate-evidence" open><summary>{reviewDocument.candidates.length} automatikus találat és szövegkörnyezete</summary><ol>{reviewDocument.candidates.map((candidate) => <li key={candidate.id}><strong>{candidate.label}</strong><span>{candidate.pageNumber ? `${candidate.pageNumber}. oldal` : "oldalszám nélkül"} · {candidate.contextSnippet}</span></li>)}</ol></details>}
            <form action={finalizeStudyReferencesAction} className="form-grid">
              <input type="hidden" name="studyId" value={selected.id} /><input type="hidden" name="documentId" value={reviewDocument.id} />
              <div className="field field--full"><label htmlFor="references">Végleges igehelylista</label><textarea id="references" name="references" className="reference-editor" defaultValue={proposedLines.join("\n")} /></div>
              <label className="check-field field--full"><input name="confirmed" type="checkbox" required /> Ellenőriztem a listát, a hiányzó vagy hibás hivatkozásokat javítottam.</label>
              <label className="check-field field--full"><input name="publishNow" type="checkbox" /> A véglegesítés után legyen azonnal publikált</label>
              <div className="form-actions field--full"><button className="button button--primary" type="submit">Igehelyek és PDF-verzió véglegesítése</button></div>
            </form>
          </section>}
          {selected && <section className="admin-panel danger-panel"><h2>Veszélyzóna</h2><form action={deleteContentAction} className="danger-zone">
            <input type="hidden" name="entity" value="study" /><input type="hidden" name="id" value={selected.id} />
            <div><strong>Tanulmány és összes PDF-verzió végleges törlése</strong><p>A tanulmány, kapcsolatai és PDF-verziói végleg törlődnek. Megerősítésként írd be pontosan: <code>{selected.title}</code></p></div>
            <input name="confirmedTitle" aria-label="A törlendő tanulmány címe" required /><button className="button button--danger button--small" type="submit">Törlés</button>
          </form></section>}
        </div>
      </div>
    </AdminShell>
  );
}
