import assert from 'node:assert/strict';
import test from 'node:test';
import { titleFromPdfLines } from './pdf-title.ts';
import type { PdfArticleLine } from './study-article.ts';

const line = (text: string, y: number, fontSize = 11): PdfArticleLine => ({ text, y, fontSize, x: 72, pageNumber: 1, pageHeight: 842 });
const body = [line('Az első bekezdés szövege.', 650), line('További olvasható szöveg.', 635), line('A tanulmány folytatódik.', 620)];

test('extracts a chapter title without its separately displayed lesson number', () => {
  assert.equal(titleFromPdfLines([line('6. Lecke – A jó és rossz paradoxona', 730, 24), ...body]), 'A jó és rossz paradoxona');
  assert.equal(titleFromPdfLines([line('2. melléklet: Történelmi háttér', 730, 24), ...body]), 'Történelmi háttér');
});

test('joins a wrapped title and skips a smaller running header', () => {
  assert.equal(titleFromPdfLines([line('Stephen Bohr tanulmányai', 810, 9), line('6. lecke – A jó és rossz', 750, 24), line('paradoxona', 722, 24), ...body]), 'A jó és rossz paradoxona');
});

test('keeps meaningful numbered titles and refuses an arbitrary opening paragraph', () => {
  assert.equal(titleFromPdfLines([line('144 000 – Kik ők?', 730, 24), ...body]), '144 000 – Kik ők?');
  assert.equal(titleFromPdfLines(body), null);
  assert.equal(titleFromPdfLines([]), null);
  assert.equal(titleFromPdfLines([line('X'.repeat(161), 730, 24), ...body]), null);
});
