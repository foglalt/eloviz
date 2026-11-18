import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { SERIES_EDIT_LOCK, seriesMembershipQueries, seriesPartsReplacementQueries } from '../src/lib/study-series-editing.ts';
import type { SeriesPartKind } from '../src/lib/study-series-core.ts';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
const seriesIds = [randomUUID(), randomUUID()];
const studyIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const prefix = `series-probe-${randomUUID()}`;
const [a, b, c, d] = studyIds;

async function assign(studyId: string, seriesId: string | null, position: number, kind: SeriesPartKind = 'lesson') {
  return sql.transaction((transaction) => [
    transaction.query(SERIES_EDIT_LOCK),
    ...seriesMembershipQueries(transaction, studyId, seriesId, position, kind),
  ]);
}
async function order(seriesId: string, kind: SeriesPartKind = 'lesson') {
  const rows = await sql.query('SELECT study_id::text,position FROM study_series_parts WHERE series_id=$1 AND kind=$2 ORDER BY position', [seriesId, kind]);
  assert.deepEqual(rows.map((row) => Number(row.position)), rows.map((_, index) => index + 1));
  return rows.map((row) => String(row.study_id));
}

try {
  await sql.transaction((transaction) => [
    ...seriesIds.map((id, index) => transaction.query(`INSERT INTO study_series(id,slug,title,description)
      VALUES($1,$2,'Synthetic series probe','Synthetic fixture; removed automatically after verification.')`, [id, `${prefix}-${index}`])),
    ...studyIds.map((id, index) => transaction.query(`INSERT INTO studies(id,slug,title,summary)
      VALUES($1,$2,'Synthetic chapter probe','Synthetic fixture; removed automatically after verification.')`, [id, `${prefix}-chapter-${index}`])),
  ]);
  await assign(a, seriesIds[0], 1);
  await assign(b, seriesIds[0], 2);
  await assign(c, seriesIds[0], 3);
  await assign(d, seriesIds[0], 2);
  assert.deepEqual(await order(seriesIds[0]), [a, d, b, c]);
  console.log('PASS: insertion shifts existing chapters without duplicate positions.');
  await assign(c, seriesIds[0], 1);
  assert.deepEqual(await order(seriesIds[0]), [c, a, d, b]);
  console.log('PASS: moving a chapter within a series preserves every chapter.');
  await assign(d, seriesIds[1], 10000);
  assert.deepEqual(await order(seriesIds[0]), [c, a, b]);
  assert.deepEqual(await order(seriesIds[1]), [d]);
  await assign(a, null, 1);
  assert.deepEqual(await order(seriesIds[0]), [c, b]);
  console.log('PASS: cross-series moves, end-position clamping and removal compact order.');
  await assert.rejects(assign(c, randomUUID(), 1));
  assert.deepEqual(await order(seriesIds[0]), [c, b]);
  console.log('PASS: failed membership rolls back the removal and all shifts.');
  await assert.rejects(sql.transaction((transaction) => [
    transaction.query(SERIES_EDIT_LOCK),
    transaction.query('DELETE FROM study_series_parts WHERE series_id=$1', [seriesIds[0]]),
    transaction.query('INSERT INTO study_series_parts(study_id,series_id,position) VALUES($1,$2,1)', [d, seriesIds[0]]),
  ]));
  assert.deepEqual(await order(seriesIds[0]), [c, b]);
  assert.deepEqual(await order(seriesIds[1]), [d]);
  console.log('PASS: conflicting series edits preserve both original lists.');
  await Promise.all([assign(a, seriesIds[0], 10000), assign(d, seriesIds[0], 10000)]);
  const concurrent = await order(seriesIds[0]);
  assert.deepEqual(concurrent.slice(0, 2), [c, b]);
  assert.deepEqual(new Set(concurrent.slice(2)), new Set([a, d]));
  assert.deepEqual(await order(seriesIds[1]), []);
  console.log('PASS: concurrent editors serialize membership updates.');
  const versionRows = await sql.query('SELECT updated_at::text AS revision FROM study_series WHERE id=$1', [seriesIds[0]]);
  await sql.query('SELECT 1/count(*)::int AS version_guard FROM study_series WHERE id=$1 AND updated_at=$2::timestamptz', [seriesIds[0], versionRows[0].revision]);
  await assign(c, seriesIds[0], 1);
  await assert.rejects(sql.query('SELECT 1/count(*)::int AS version_guard FROM study_series WHERE id=$1 AND updated_at=$2::timestamptz', [seriesIds[0], versionRows[0].revision]));
  console.log('PASS: exact timestamp guards accept fresh edits and reject stale versions.');
  await assign(a, seriesIds[0], 1, 'supplement');
  await assign(d, seriesIds[0], 2, 'supplement');
  assert.deepEqual(await order(seriesIds[0]), [c, b]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [a, d]);
  await assign(b, seriesIds[0], 2, 'supplement');
  assert.deepEqual(await order(seriesIds[0]), [c]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [a, b, d]);
  console.log('PASS: kind changes compact the old group and insert only in the target group.');
  await assign(d, seriesIds[1], 1);
  await assign(a, seriesIds[1], 10000, 'supplement');
  assert.deepEqual(await order(seriesIds[1]), [d]);
  assert.deepEqual(await order(seriesIds[1], 'supplement'), [a]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [b]);
  await assign(b, null, 1);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), []);
  console.log('PASS: different groups can share position1; cross-series moves/removal preserve both groups.');
  await assign(a, seriesIds[0], 1, 'supplement');
  await sql.transaction((tx) => [tx.query(SERIES_EDIT_LOCK), ...seriesPartsReplacementQueries(tx, seriesIds[0], [b, c], [a])]);
  assert.deepEqual(await order(seriesIds[0]), [b, c]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [a]);
  await assert.rejects(sql.transaction((tx) => [tx.query(SERIES_EDIT_LOCK), ...seriesPartsReplacementQueries(tx, seriesIds[0], [b, c], [d])]));
  assert.deepEqual(await order(seriesIds[0]), [b, c]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [a]);
  await assert.rejects(sql.query("INSERT INTO study_series_parts(study_id,series_id,position,kind) VALUES($1,$2,1,'unknown')", [randomUUID(), seriesIds[0]]));
  await assert.rejects(sql.transaction((tx) => [tx.query(SERIES_EDIT_LOCK), ...seriesMembershipQueries(tx, b, seriesIds[0], 1, 'supplement'), tx.query('SELECT 1/0')]));
  assert.deepEqual(await order(seriesIds[0]), [b, c]);
  assert.deepEqual(await order(seriesIds[0], 'supplement'), [a]);
  console.log('PASS: series-editor group reorder and cross-group failures roll back completely.');
  await Promise.all([assign(c, seriesIds[0], 10000, 'supplement'), assign(d, seriesIds[0], 10000, 'supplement')]);
  assert.deepEqual(await order(seriesIds[0]), [b]);
  const supplements = await order(seriesIds[0], 'supplement');
  assert.equal(supplements[0], a);
  assert.deepEqual(new Set(supplements.slice(1)), new Set([c, d]));
  console.log('PASS: concurrent mixed-group saves serialize without collisions or loss.');
} finally {
  // Only IDs generated for this run are removed. Real content is never selected.
  await sql.transaction((transaction) => [
    transaction.query('DELETE FROM study_series WHERE id=ANY($1::uuid[])', [seriesIds]),
    transaction.query('DELETE FROM studies WHERE id=ANY($1::uuid[])', [studyIds]),
  ]);
  console.log('Synthetic fixtures removed.');
}
