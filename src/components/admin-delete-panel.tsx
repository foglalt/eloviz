import { deleteContentAction } from "@/app/admin/actions";

type DeleteEntity = "topic" | "study" | "video";

type Props = {
  entity: DeleteEntity;
  id: string;
  title: string;
};

const deleteCopy: Record<DeleteEntity, {
  heading: string;
  description: string;
  inputLabel: string;
}> = {
  topic: {
    heading: "Téma végleges törlése",
    description: "A téma és kapcsolatai végleg törlődnek.",
    inputLabel: "A törlendő téma címe",
  },
  study: {
    heading: "Tanulmány és összes PDF-verzió végleges törlése",
    description: "A tanulmány, kapcsolatai és PDF-verziói végleg törlődnek.",
    inputLabel: "A törlendő tanulmány címe",
  },
  video: {
    heading: "Videó végleges törlése",
    description: "A videó és kapcsolatai végleg törlődnek.",
    inputLabel: "A törlendő videó címe",
  },
};

export function AdminDeletePanel({ entity, id, title }: Props) {
  const copy = deleteCopy[entity];
  return (
    <section className="admin-panel danger-panel">
      <h2>Veszélyzóna</h2>
      <form action={deleteContentAction} className="danger-zone">
        <input type="hidden" name="entity" value={entity} />
        <input type="hidden" name="id" value={id} />
        <div>
          <strong>{copy.heading}</strong>
          <p>{copy.description} Megerősítésként írd be pontosan: <code>{title}</code></p>
        </div>
        <input name="confirmedTitle" aria-label={copy.inputLabel} required />
        <button className="button button--danger button--small" type="submit">Törlés</button>
      </form>
    </section>
  );
}
