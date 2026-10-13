import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { SERIES_EDIT_LOCK, seriesMembershipQueries } from '../src/lib/study-series-editing.ts';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
const seriesIds = [randomUUID(), randomUUID()];
const studyIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const prefix = `series-probe-${randomUUID()}`;
const [a, b, c, d] = studyIds;

async function assign(studyId: string, seriesId: string | null, position: number) {
  return sql.transaction((transaction) => [
    transaction.query(SERIES_EDIT_LOCK),
    ...seriesMembershipQueries(transaction, studyId, seriesId, position),
  ]);
}
async function order(seriesId: string) {
  const rows = await sql.query('SELECT study_id::text,position FROM study_series_parts WHERE series_id=$1 ORDER BY position', [seriesId]);
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
} finally {
  // Only IDs generated for this run are removed. Real content is never selected.
  await sql.transaction((transaction) => [
    transaction.query('DELETE FROM study_series WHERE id=ANY($1::uuid[])', [seriesIds]),
    transaction.query('DELETE FROM studies WHERE id=ANY($1::uuid[])', [studyIds]),
  ]);
  console.log('Synthetic fixtures removed.');
}
