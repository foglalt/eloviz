import { redirect } from "next/navigation";
import { AdminContentFormFields } from "@/components/admin-content-form-fields";
import { AdminContentIndex } from "@/components/admin-content-index";
import { AdminContentWorkspace } from "@/components/admin-content-workspace";
import { AdminDeletePanel } from "@/components/admin-delete-panel";
import { AdminEditorPanel } from "@/components/admin-editor-panel";
import { AdminRelationPicker } from "@/components/admin-relation-picker";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAdminVideo,
  listAdminStudyOptions,
  listAdminTopicOptions,
  listAdminVideoIndex,
} from "@/lib/content-repository";
import { saveVideoAction } from "../actions";

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

export default async function AdminVideosPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const query = await searchParams;
  const search = query.q?.trim().slice(0, 120) ?? "";
  const requestedPage = Number.parseInt(query.page ?? "1", 10) || 1;
  const [videoIndex, selected, topics, studies] = await Promise.all([
    listAdminVideoIndex(search, requestedPage),
    query.edit ? getAdminVideo(query.edit) : Promise.resolve(null),
    listAdminTopicOptions(),
    listAdminStudyOptions(),
  ]);

  return (
    <AdminContentWorkspace
      eyebrow="YouTube-gyűjtemény"
      title="Videók"
      message={query.message}
      error={query.error}
      index={(
        <AdminContentIndex
          basePath="/admin/videok"
          heading="Videók"
          countLabel={`${videoIndex.total} videó`}
          searchId="video-search"
          search={search}
          selectedId={selected?.id}
          page={videoIndex.page}
          pageCount={videoIndex.pageCount}
          paginationLabel="Videólista lapozása"
          items={videoIndex.items}
          emptyLabel="Nincs találat."
        />
      )}
    >
      <AdminEditorPanel title={selected ? "Videó szerkesztése" : "Új videó"}>
        <form key={selected?.id ?? "new"} action={saveVideoAction} className="form-grid">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <AdminContentFormFields record={selected} featuredLabel="Kiemelt videó">
            <div className="field field--full">
              <label htmlFor="youtubeUrl">YouTube-link</label>
              <input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                defaultValue={selected?.youtubeUrl}
                placeholder="https://www.youtube.com/watch?v=…"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="channelName">Csatorna neve</label>
              <input id="channelName" name="channelName" defaultValue={selected?.channelName ?? ""} />
            </div>
            <div className="field field--full">
              <label htmlFor="description">Leírás</label>
              <textarea id="description" name="description" defaultValue={selected?.description} required />
            </div>
            <fieldset className="field field--full">
              <legend>Témák</legend>
              <AdminRelationPicker
                key={`video-topics-${selected?.id ?? "new"}`}
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
              <legend>Kapcsolódó tanulmányok</legend>
              <AdminRelationPicker
                key={`video-studies-${selected?.id ?? "new"}`}
                name="relatedStudyIds"
                options={studies.map((study) => ({
                  id: study.id,
                  label: study.title,
                  meta: study.status === "published" ? "élő" : "vázlat",
                }))}
                selectedIds={selected?.relatedStudyIds}
                searchLabel="Tanulmányok szűrése"
                emptyLabel="Nincs ilyen tanulmány."
              />
            </fieldset>
          </AdminContentFormFields>
          <div className="form-actions field--full">
            <button className="button button--primary" type="submit">Mentés</button>
          </div>
        </form>
      </AdminEditorPanel>
      {selected ? <AdminDeletePanel entity="video" id={selected.id} title={selected.title} /> : null}
    </AdminContentWorkspace>
  );
}
