import assert from 'node:assert/strict';
import { test } from 'node:test';
import { moveSeriesPart, publishedSeriesParts, seriesNeighbours } from './study-series-core.ts';
import { studySeriesInputSchema } from './content-validation.ts';

const first = { id: 'first', position: 1, status: 'published' as const, hasPublishedDocument: true };
const draft = { id: 'draft', position: 2, status: 'draft' as const, hasPublishedDocument: true };
const third = { id: 'third', position: 3, status: 'published' as const, hasPublishedDocument: true };

test('public chapter order ignores general catalogue order and preserves missing chapter numbers', () => {
  assert.deepEqual(publishedSeriesParts([third, draft, first]).map((part) => [part.id, part.position]), [['first', 1], ['third', 3]]);
});
test('published chapters without their PDF and drafts never enter public navigation', () => {
  assert.deepEqual(publishedSeriesParts([draft, { ...first, hasPublishedDocument: false }]), []);
});
test('previous/next navigation skips drafts and handles the first and last chapter', () => {
  const parts = publishedSeriesParts([first, draft, third]);
  assert.deepEqual(seriesNeighbours(parts, first.id), { previous: null, next: third });
  assert.deepEqual(seriesNeighbours(parts, third.id), { previous: first, next: null });
  assert.deepEqual(seriesNeighbours(parts, draft.id), { previous: null, next: null });
});
test('single-part series and an empty series have no neighbour', () => {
  assert.deepEqual(seriesNeighbours([first], first.id), { previous: null, next: null });
  assert.deepEqual(seriesNeighbours([], first.id), { previous: null, next: null });
});
test('editor ordering keeps every chapter and does not mutate incoming data', () => {
  const ids = ['a', 'b', 'c'];
  assert.deepEqual(moveSeriesPart(ids, 'c', -1), ['a', 'c', 'b']);
  assert.deepEqual(moveSeriesPart(ids, 'a', 1), ['b', 'a', 'c']);
  assert.deepEqual(ids, ['a', 'b', 'c']);
  assert.deepEqual(moveSeriesPart(ids, 'a', -1), ids);
  assert.deepEqual(moveSeriesPart(ids, 'missing', 1), ids);
});
test('series validation rejects duplicate membership and unsafe source protocols', () => {
  const input = { title: 'Tanulmánysorozat', slug: 'tanulmanysorozat', description: 'Önálló fejezetekre bontott, részletes bibliatanulmány.', status: 'draft', partIds: [] };
  assert.equal(studySeriesInputSchema.safeParse(input).success, true);
  const id = '4b1b568e-72f0-447a-84d1-f587d8db557a';
  assert.equal(studySeriesInputSchema.safeParse({ ...input, partIds: [id, id] }).success, false);
  assert.equal(studySeriesInputSchema.safeParse({ ...input, sourceUrl: 'javascript:alert(1)' }).success, false);
  assert.equal(studySeriesInputSchema.safeParse({ ...input, sourceUrl: 'https://sumtv.org/study-notes' }).success, true);
});
