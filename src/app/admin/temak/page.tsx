import { redirect } from "next/navigation";
import { AdminContentFormFields } from "@/components/admin-content-form-fields";
import { AdminContentIndex } from "@/components/admin-content-index";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminDeletePanel } from "@/components/admin-delete-panel";
import { AdminEditorPanel } from "@/components/admin-editor-panel";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminTopic, listAdminTopicIndex } from "@/lib/content-repository";
import { saveTopicAction } from "../actions";

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

export default async function AdminTopicsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 120) ?? "";
  const requestedPage = Number.parseInt(query.page ?? "1", 10) || 1;
  const [topicIndex, selected] = await Promise.all([
    listAdminTopicIndex(search, requestedPage),
    query.edit ? getAdminTopic(query.edit) : Promise.resolve(null),
  ]);

  return (
    <AdminContentWorkspace
      eyebrow="Rendszerezés"
      title="Témák"
      message={query.message}
      error={query.error}
      index={(
        <AdminContentIndex
          basePath="/admin/temak"
          heading="Témák"
          countLabel={`${topicIndex.total} téma`}
          searchId="topic-search"
          search={search}
          selectedId={selected?.id}
          page={topicIndex.page}
          pageCount={topicIndex.pageCount}
          paginationLabel="Témalista lapozása"
          items={topicIndex.items}
          emptyLabel="Nincs találat."
        />
      )}
    >
      <AdminEditorPanel title={selected ? "Téma szerkesztése" : "Új téma"}>
        <form key={selected?.id ?? "new"} action={saveTopicAction} className="form-grid">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <AdminContentFormFields record={selected} featuredLabel="Kiemelt téma">
            <div className="field field--full">
              <label htmlFor="description">Leírás</label>
              <textarea id="description" name="description" defaultValue={selected?.description} required />
            </div>
          </AdminContentFormFields>
          <div className="form-actions field--full">
            <button className="button button--primary" type="submit">Mentés</button>
          </div>
        </form>
      </AdminEditorPanel>
      {selected ? <AdminDeletePanel entity="topic" id={selected.id} title={selected.title} /> : null}
    </AdminContentWorkspace>
  );
}
