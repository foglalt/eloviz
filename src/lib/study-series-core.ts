export type OrderedStudyPart = {
  id: string;
  position: number;
  status: 'draft' | 'published';
  hasPublishedDocument: boolean;
};

// Keep editorial chapter numbers, even when an unpublished chapter is omitted.
export function publishedSeriesParts<T extends OrderedStudyPart>(parts: readonly T[]): T[] {
  return parts
    .filter((part) => part.status === 'published' && part.hasPublishedDocument)
    .toSorted((a, b) => a.position - b.position);
}

export function seriesNeighbours<T extends { id: string }>(parts: readonly T[], studyId: string) {
  const index = parts.findIndex((part) => part.id === studyId);
  return {
    previous: index > 0 ? parts[index - 1] : null,
    next: index >= 0 ? parts[index + 1] ?? null : null,
  };
}

export function moveSeriesPart(ids: readonly string[], id: string, direction: -1 | 1) {
  const result = [...ids];
  const index = result.indexOf(id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= result.length) return result;
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}
