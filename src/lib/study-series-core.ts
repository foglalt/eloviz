export type SeriesPartKind = 'lesson' | 'supplement';

export type OrderedStudyPart = {
  id: string;
  kind?: SeriesPartKind;
  position: number;
  status: 'draft' | 'published';
  hasPublishedDocument: boolean;
};

// Keep editorial chapter numbers, even when an unpublished chapter is omitted.
export function publishedSeriesParts<T extends OrderedStudyPart>(parts: readonly T[]): T[] {
  return parts
    .filter((part) => part.status === 'published' && part.hasPublishedDocument)
    .toSorted((a, b) => Number(a.kind === 'supplement') - Number(b.kind === 'supplement') || a.position - b.position);
}

export function seriesPartGroups<T extends { id: string; kind?: SeriesPartKind }>(parts: readonly T[]) {
  return {
    lessons: parts.filter((part) => part.kind !== 'supplement'),
    supplements: parts.filter((part) => part.kind === 'supplement'),
  };
}

export function seriesPartLabel(part: { position: number; kind?: SeriesPartKind }) {
  return `${part.position}. ${part.kind === 'supplement' ? 'melléklet' : 'lecke'}`;
}

export function seriesCountLabel(parts: readonly { id: string; kind?: SeriesPartKind }[]) {
  const { lessons, supplements } = seriesPartGroups(parts);
  return [lessons.length ? `${lessons.length} lecke` : '', supplements.length ? `${supplements.length} melléklet` : '']
    .filter(Boolean).join(' · ') || '0 lecke';
}

export function nextSeriesPosition(parts: readonly { position: number; kind?: SeriesPartKind }[], kind: SeriesPartKind) {
  return parts.filter((part) => (part.kind ?? 'lesson') === kind).reduce((last, part) => Math.max(last, part.position), 0) + 1;
}

export function seriesNeighbours<T extends { id: string; kind?: SeriesPartKind }>(parts: readonly T[], studyId: string) {
  const lessons = seriesPartGroups(parts).lessons;
  const index = lessons.findIndex((part) => part.id === studyId);
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 ? lessons[index + 1] ?? null : null,
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
