import type { NeonQueryFunctionInTransaction } from '@neondatabase/serverless';
import type { SeriesPartKind } from './study-series-core.ts';

// All membership editors share this lock, including series reorder and study removal.
export const SERIES_EDIT_LOCK = 'SELECT pg_advisory_xact_lock(830033)';
export const COMPACT_SERIES_POSITIONS = `WITH numbered AS (
  SELECT study_id, row_number() OVER (PARTITION BY series_id, kind ORDER BY position)::int AS new_position
  FROM study_series_parts
) UPDATE study_series_parts p SET position=n.new_position FROM numbered n
  WHERE p.study_id=n.study_id AND p.position<>n.new_position`;

export function seriesPartsReplacementQueries(
  transaction: NeonQueryFunctionInTransaction<false, false>,
  seriesId: string,
  lessonIds: readonly string[],
  supplementIds: readonly string[],
) {
  return [
    transaction.query('DELETE FROM study_series_parts WHERE series_id=$1', [seriesId]),
    ...([['lesson', lessonIds], ['supplement', supplementIds]] as const).flatMap(([kind, studyIds]) =>
      studyIds.map((studyId, index) => transaction.query(
        'INSERT INTO study_series_parts(study_id,series_id,position,kind) VALUES($1,$2,$3,$4)',
        [studyId, seriesId, index + 1, kind],
      ))),
  ];
}

export function seriesMembershipQueries(
  transaction: NeonQueryFunctionInTransaction<false, false>,
  studyId: string,
  seriesId: string | null,
  position: number,
  kind: SeriesPartKind = 'lesson',
) {
  return [
    transaction.query(`UPDATE study_series SET updated_at=now()
      WHERE id=$2::uuid OR id IN (SELECT series_id FROM study_series_parts WHERE study_id=$1)`, [studyId, seriesId]),
    transaction.query('DELETE FROM study_series_parts WHERE study_id=$1', [studyId]),
    transaction.query(COMPACT_SERIES_POSITIONS),
    ...(seriesId ? [
      transaction.query(`UPDATE study_series_parts SET position=position+1
        WHERE series_id=$1 AND kind=$3 AND position>=LEAST($2::int,
          (SELECT count(*)::int+1 FROM study_series_parts WHERE series_id=$1 AND kind=$3))`, [seriesId, position, kind]),
      transaction.query(`INSERT INTO study_series_parts(study_id,series_id,position,kind)
        SELECT $1,$2,LEAST($3::int,count(*)::int+1),$4 FROM study_series_parts WHERE series_id=$2 AND kind=$4`, [studyId, seriesId, position, kind]),
    ] : []),
  ];
}
