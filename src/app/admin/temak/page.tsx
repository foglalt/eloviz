import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminTopics } from "@/lib/content-repository";
import { deleteContentAction, saveTopicAction } from "../actions";

type Props = { searchParams: Promise<{ edit?: string; message?: string; error?: string }> };
export const dynamic = "force-dynamic";

export default async function AdminTopicsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const topics = await listAdminTopics();
  const selected = topics.find((topic) => topic.id === query.edit);

  return (
    <AdminShell>
      <div className="admin-heading"><div><p className="eyebrow">Rendszerezés</p><h1>Témák</h1></div><Link className="button button--small" href="/admin/temak">Új téma</Link></div>
      <AdminNotice message={query.message} error={query.error} />
      <div className="admin-grid">
        <aside className="admin-panel">
          <h2>Meglévő témák</h2>
          <ul className="admin-list">
            {topics.map((topic) => {
              const isSelected = selected?.id === topic.id;
              return <li key={topic.id} className={isSelected ? "is-selected" : undefined}><span><strong>{topic.title}</strong><small>/{topic.slug}</small></span><span><i className={`status${topic.status === "draft" ? " status--draft" : ""}`}>{topic.status === "published" ? "élő" : "vázlat"}</i> <Link href={`/admin/temak?edit=${topic.id}`} aria-current={isSelected ? "page" : undefined}>{isSelected ? "Kiválasztva" : "Szerkesztés"}</Link></span></li>;
            })}
          </ul>
        </aside>
        <section className="admin-panel">
          <h2>{selected ? "Téma szerkesztése" : "Új téma"}</h2>
          <form key={selected?.id ?? "new"} action={saveTopicAction} className="form-grid">
            {selected && <input type="hidden" name="id" value={selected.id} />}
            <div className="field"><label htmlFor="title">Cím</label><input id="title" name="title" defaultValue={selected?.title} required /></div>
            <div className="field"><label htmlFor="slug">URL slug</label><input id="slug" name="slug" defaultValue={selected?.slug} placeholder="automatikus-a-cimbol" /></div>
            <div className="field field--full"><label htmlFor="description">Leírás</label><textarea id="description" name="description" defaultValue={selected?.description} required /></div>
            <div className="field"><label htmlFor="seoTitle">SEO-cím (max. 70)</label><input id="seoTitle" name="seoTitle" defaultValue={selected?.seoTitle} maxLength={70} /></div>
            <div className="field"><label htmlFor="seoDescription">SEO-leírás (max. 170)</label><textarea id="seoDescription" name="seoDescription" defaultValue={selected?.seoDescription} maxLength={170} /></div>
            <div className="field"><label htmlFor="status">Állapot</label><select id="status" name="status" defaultValue={selected?.status ?? "draft"}><option value="draft">Vázlat</option><option value="published">Publikált</option></select></div>
            <div className="field"><label htmlFor="sortOrder">Sorrend</label><input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue={selected?.sortOrder ?? 0} /></div>
            <label className="check-field field--full"><input name="featured" type="checkbox" defaultChecked={selected?.featured} /> Kiemelt téma</label>
            <div className="form-actions field--full"><button className="button button--primary" type="submit">Mentés</button></div>
          </form>
          {selected && <form action={deleteContentAction} className="danger-zone">
            <input type="hidden" name="entity" value="topic" /><input type="hidden" name="id" value={selected.id} />
            <div><strong>Téma végleges törlése</strong><p>A téma és kapcsolatai végleg törlődnek. Megerősítésként írd be pontosan: <code>{selected.title}</code></p></div>
            <input name="confirmedTitle" aria-label="A törlendő téma címe" required /><button className="button button--danger button--small" type="submit">Törlés</button>
          </form>}
        </section>
      </div>
    </AdminShell>
  );
}
