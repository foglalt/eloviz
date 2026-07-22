export type StudyPublicationStatus = "draft" | "published";

export function resolveStudyPublicationStatus(
  requestedStatus: StudyPublicationStatus,
  hasPublishedDocument: boolean,
) {
  const status = requestedStatus === "published" && hasPublishedDocument
    ? "published"
    : "draft";

  return {
    status,
    downgraded: requestedStatus === "published" && status === "draft",
  } as const;
}
