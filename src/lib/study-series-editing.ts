import type { NeonQueryFunctionInTransaction } from '@neondatabase/serverless';

// All membership editors share this lock, including series reorder and study removal.
export const SERIES_EDIT_LOCK = 'SELECT pg_advisory_xact_lock(830033)';
export const COMPACT_SERIES_POSITIONS = `WITH numbered AS (
  SELECT study_id, row_number() OVER (PARTITION BY series_id ORDER BY position)::int AS new_position
  FROM study_series_parts
) UPDATE study_series_parts p SET position=n.new_position FROM numbered n
  WHERE p.study_id=n.study_id AND p.position<>n.new_position`;

export function seriesMembershipQueries(
  transaction: NeonQueryFunctionInTransaction<false, false>,
  studyId: string,
  seriesId: string | null,
  position: number,
) {
  return [
    transaction.query(`UPDATE study_series SET updated_at=now()
      WHERE id=$2::uuid OR id IN (SELECT series_id FROM study_series_parts WHERE study_id=$1)`, [studyId, seriesId]),
    transaction.query('DELETE FROM study_series_parts WHERE study_id=$1', [studyId]),
    transaction.query(COMPACT_SERIES_POSITIONS),
    ...(seriesId ? [
      transaction.query(`UPDATE study_series_parts SET position=position+1
        WHERE series_id=$1 AND position>=LEAST($2::int,
          (SELECT count(*)::int+1 FROM study_series_parts WHERE series_id=$1))`, [seriesId, position]),
      transaction.query(`INSERT INTO study_series_parts(study_id,series_id,position)
        SELECT $1,$2,LEAST($3::int,count(*)::int+1) FROM study_series_parts WHERE series_id=$2`, [studyId, seriesId, position]),
    ] : []),
  ];
}
