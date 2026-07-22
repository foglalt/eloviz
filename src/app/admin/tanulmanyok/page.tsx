import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminStudies, listAdminTopics, listAdminVideos } from "@/lib/content-repository";
import { deleteContentAction, deleteStudyDocumentAction, finalizeStudyReferencesAction, saveStudyAction, uploadStudyPdfAction } from "../actions";

type Props = { searchParams: Promise<{ edit?: string; message?: string; error?: string }> };
export const dynamic = "force-dynamic";

function referenceLine(reference: { label: string; osisStart: string; osisEnd: string }) {
  return `${reference.label} | ${reference.osisStart}${reference.osisEnd !== reference.osisStart ? `-${reference.osisEnd}` : ""}`;
}

export default async function AdminStudiesPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const [studies, topics, videos] = await Promise.all([listAdminStudies(), listAdminTopics(), listAdminVideos()]);
  const selected = studies.find((study) => study.id === query.edit);
  const reviewDocument = selected?.documents[0];
  const proposedLines = reviewDocument?.candidates.length
    ? reviewDocument.candidates.map(referenceLine)
    : selected?.references.map(referenceLine) ?? [];

  return (
    <AdminShell>
      <div className="admin-heading"><div><p className="eyebrow">PDF-könyvtár</p><h1>Tanulmányok</h1></div><Link className="button button--small" href="/admin/tanulmanyok">Új tanulmány</Link></div>
      <AdminNotice message={query.message} error={query.error} />
      <div className="admin-grid">
        <aside className="admin-panel">
          <h2>Tanulmányok</h2>
          <ul className="admin-list">
            {studies.map((study) => {
              const isSelected = selected?.id === study.id;
              return <li key={study.id} className={isSelected ? "is-selected" : undefined}><span><strong>{study.title}</strong><small>{study.documents.length} PDF-verzió · {study.referenceReviewed ? "ellenőrizve" : "ellenőrzésre vár"}</small></span><span><i className={`status${study.status === "draft" ? " status--draft" : ""}`}>{study.status === "published" ? "élő" : "vázlat"}</i> <Link href={`/admin/tanulmanyok?edit=${study.id}`} aria-current={isSelected ? "page" : undefined}>{isSelected ? "Kiválasztva" : "Szerkesztés"}</Link></span></li>;
            })}
          </ul>
        </aside>
        <div className="admin-stack">
          <section className="admin-panel">
            <h2>{selected ? "Tanulmány szerkesztése" : "Új tanulmány"}</h2>
            <p className="admin-help">Először mentsd a vázlatot. Ezután tölthetsz fel hozzá PDF-et és ellenőrizheted az automatikusan talált igehelyeket.</p>
            <form key={selected?.id ?? "new"} action={saveStudyAction} className="form-grid">
              {selected && <input type="hidden" name="id" value={selected.id} />}
              <div className="field"><label htmlFor="title">Cím</label><input id="title" name="title" defaultValue={selected?.title} required /></div>
              <div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" defaultValue={selected?.slug} placeholder="automatikus-a-cimbol" /></div>
              <div className="field field--full"><label htmlFor="summary">Összefoglaló</label><textarea id="summary" name="summary" defaultValue={selected?.summary} required /></div>
              <fieldset className="field field--full"><legend>Témák</legend><div className="check-grid">{topics.map((topic) => <label className="check-field" key={topic.id}><input type="checkbox" name="topicIds" value={topic.id} defaultChecked={selected?.topics.some((item) => item.id === topic.id)} /> {topic.title}</label>)}</div></fieldset>
              <fieldset className="field field--full"><legend>Kapcsolódó videók</legend><div className="check-grid">{videos.length ? videos.map((video) => <label className="check-field" key={video.id}><input type="checkbox" name="relatedVideoIds" value={video.id} defaultChecked={selected?.relatedVideoIds.includes(video.id)} /> {video.title}</label>) : <span className="admin-help">Még nincs videó a gyűjteményben.</span>}</div></fieldset>
              <div className="field"><label htmlFor="seoTitle">SEO-cím</label><input id="seoTitle" name="seoTitle" defaultValue={selected?.seoTitle} maxLength={70} /></div>
              <div className="field"><label htmlFor="seoDescription">SEO-leírás</label><textarea id="seoDescription" name="seoDescription" defaultValue={selected?.seoDescription} maxLength={170} /></div>
              <div className="field"><label htmlFor="status">Állapot</label><select id="status" name="status" defaultValue={selected?.status ?? "draft"}><option value="draft">Vázlat</option><option value="published">Publikált</option></select></div>
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
              const isProtected = isPublishedDocument && selected.status === "published";
              return <li key={document.id}>
                <div className="document-history__meta">
                  <strong>v{document.versionNumber} · {document.originalFilename}</strong>
                  <span>{Math.round(document.byteSize / 1024)} kB · {document.extractionStatus === "complete" ? "szöveg kiolvasva" : "kézi ellenőrzés szükséges"}{isPublishedDocument ? " · jelenlegi PDF" : ""}</span>
                </div>
                <div className="document-history__actions">
                  <Link className="document-link" href={`/api/documents/${document.id}`} target="_blank" rel="noreferrer">PDF megnyitása ↗</Link>
                  {isProtected
                    ? <small className="document-protected">Eltávolítás előtt állítsd vázlatra.</small>
                    : <form action={deleteStudyDocumentAction} className="document-delete">
                        <input type="hidden" name="studyId" value={selected.id} />
                        <input type="hidden" name="documentId" value={document.id} />
                        <label><input type="checkbox" name="confirmed" required /> Törlés megerősítése</label>
                        <button className="admin-link-button admin-link-button--danger" type="submit">Eltávolítás</button>
                      </form>}
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
            <div><strong>Vázlat és összes PDF-verzió végleges törlése</strong><p>Publikált tanulmány nem törölhető. Megerősítésként írd be pontosan: <code>{selected.title}</code></p></div>
            <input name="confirmedTitle" aria-label="A törlendő tanulmány címe" required /><button className="button button--danger button--small" type="submit">Törlés</button>
          </form></section>}
        </div>
      </div>
    </AdminShell>
  );
}
