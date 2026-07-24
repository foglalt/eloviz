import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminRelationPicker } from "@/components/admin-relation-picker";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminStudyOptions, listAdminTopics, listAdminVideos } from "@/lib/content-repository";
import { deleteContentAction, saveVideoAction } from "../actions";

type Props = { searchParams: Promise<{ edit?: string; message?: string; error?: string }> };
export const dynamic = "force-dynamic";

export default async function AdminVideosPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const [videos, topics, studies] = await Promise.all([listAdminVideos(), listAdminTopics(), listAdminStudyOptions()]);
  const selected = videos.find((video) => video.id === query.edit);

  return (
    <AdminShell>
      <div className="admin-heading"><div><p className="eyebrow">YouTube-gyűjtemény</p><h1>Videók</h1></div><Link className="button button--small" href="/admin/videok">Új videó</Link></div>
      <AdminNotice message={query.message} error={query.error} />
      <div className="admin-grid">
        <aside className="admin-panel"><h2>Videók</h2><ul className="admin-list">{videos.map((video) => {
          const isSelected = selected?.id === video.id;
          return <li key={video.id} className={isSelected ? "is-selected" : undefined}><span><strong>{video.title}</strong><small>{video.channelName || "Csatorna nélkül"}</small></span><span><i className={`status${video.status === "draft" ? " status--draft" : ""}`}>{video.status === "published" ? "élő" : "vázlat"}</i> <Link href={`/admin/videok?edit=${video.id}`} aria-current={isSelected ? "page" : undefined}>{isSelected ? "Kiválasztva" : "Szerkesztés"}</Link></span></li>;
        })}{videos.length === 0 && <li>Még nincs videó.</li>}</ul></aside>
        <section className="admin-panel">
          <h2>{selected ? "Videó szerkesztése" : "Új videó"}</h2>
          <form key={selected?.id ?? "new"} action={saveVideoAction} className="form-grid">
            {selected && <input type="hidden" name="id" value={selected.id} />}
            <div className="field"><label htmlFor="title">Cím</label><input id="title" name="title" defaultValue={selected?.title} required /></div>
            <div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" defaultValue={selected?.slug} placeholder="automatikus-a-cimbol" /></div>
            <div className="field field--full"><label htmlFor="youtubeUrl">YouTube-link</label><input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={selected?.youtubeUrl} placeholder="https://www.youtube.com/watch?v=…" required /></div>
            <div className="field"><label htmlFor="channelName">Csatorna neve</label><input id="channelName" name="channelName" defaultValue={selected?.channelName ?? ""} /></div>
            <div className="field field--full"><label htmlFor="description">Leírás</label><textarea id="description" name="description" defaultValue={selected?.description} required /></div>
            <fieldset className="field field--full"><legend>Témák</legend><AdminRelationPicker key={`video-topics-${selected?.id ?? "new"}`} name="topicIds" options={topics.map((topic) => ({ id: topic.id, label: topic.title, meta: topic.status === "published" ? "élő" : "vázlat" }))} selectedIds={selected?.topics.map((item) => item.id)} searchLabel="Témák szűrése" emptyLabel="Nincs ilyen téma." /></fieldset>
            <fieldset className="field field--full"><legend>Kapcsolódó tanulmányok</legend><AdminRelationPicker key={`video-studies-${selected?.id ?? "new"}`} name="relatedStudyIds" options={studies.map((study) => ({ id: study.id, label: study.title, meta: study.status === "published" ? "élő" : "vázlat" }))} selectedIds={selected?.relatedStudyIds} searchLabel="Tanulmányok szűrése" emptyLabel="Nincs ilyen tanulmány." /></fieldset>
            <div className="field"><label htmlFor="seoTitle">SEO-cím</label><input id="seoTitle" name="seoTitle" defaultValue={selected?.seoTitle} maxLength={70} /></div>
            <div className="field"><label htmlFor="seoDescription">SEO-leírás</label><textarea id="seoDescription" name="seoDescription" defaultValue={selected?.seoDescription} maxLength={170} /></div>
            <div className="field"><label htmlFor="status">Állapot</label><select id="status" name="status" defaultValue={selected?.status ?? "draft"}><option value="draft">Vázlat</option><option value="published">Publikált</option></select></div>
            <div className="field"><label htmlFor="sortOrder">Sorrend</label><input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue={selected?.sortOrder ?? 0} /></div>
            <label className="check-field field--full"><input name="featured" type="checkbox" defaultChecked={selected?.featured} /> Kiemelt videó</label>
            <div className="form-actions field--full"><button className="button button--primary" type="submit">Mentés</button></div>
          </form>
          {selected && <form action={deleteContentAction} className="danger-zone">
            <input type="hidden" name="entity" value="video" /><input type="hidden" name="id" value={selected.id} />
            <div><strong>Videó végleges törlése</strong><p>A videó és kapcsolatai végleg törlődnek. Megerősítésként írd be pontosan: <code>{selected.title}</code></p></div>
            <input name="confirmedTitle" aria-label="A törlendő videó címe" required /><button className="button button--danger button--small" type="submit">Törlés</button>
          </form>}
        </section>
      </div>
    </AdminShell>
  );
}
