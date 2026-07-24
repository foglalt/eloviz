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

export function resolveStudyDocumentRemoval(
  currentStatus: StudyPublicationStatus,
  removesPublishedDocument: boolean,
) {
  const status = removesPublishedDocument ? "draft" : currentStatus;

  return {
    status,
    downgraded: currentStatus === "published" && status === "draft",
  } as const;
}
