export type StudyRelationPair = {
  studyAId: string;
  studyBId: string;
};

export function canonicalStudyRelationPair(
  leftStudyId: string,
  rightStudyId: string,
): StudyRelationPair | null {
  if (leftStudyId === rightStudyId) return null;
  return leftStudyId < rightStudyId
    ? { studyAId: leftStudyId, studyBId: rightStudyId }
    : { studyAId: rightStudyId, studyBId: leftStudyId };
}

export function relatedStudyId(
  pair: StudyRelationPair,
  currentStudyId: string,
) {
  if (pair.studyAId === currentStudyId) return pair.studyBId;
  if (pair.studyBId === currentStudyId) return pair.studyAId;
  return null;
}
