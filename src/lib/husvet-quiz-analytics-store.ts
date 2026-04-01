import { neon } from "@neondatabase/serverless";

export type HusvetQuizDeviceProgressInput = {
  answeredCount: number;
  correctAnswers: number;
  currentIndex: number;
  deviceId: string;
  isComplete: boolean;
  quizSlug: "husvet";
  totalQuestions: number;
  userAgent: string;
};

export type HusvetQuizDeviceProgress = {
  answeredCount: number;
  correctAnswers: number;
  currentIndex: number;
  deviceId: string;
  firstSeenAt: string;
  isComplete: boolean;
  lastSeenAt: string;
  quizSlug: "husvet";
  totalQuestions: number;
  userAgent: string;
};

export type QuizAnalyticsStorageStatus = {
  configured: boolean;
  label: string;
  note: string;
};

type QuizDeviceProgressRow = {
  answered_count: number;
  correct_answers: number;
  current_index: number;
  device_id: string;
  first_seen_at: string;
  is_complete: boolean;
  last_seen_at: string;
  quiz_slug: string;
  total_questions: number;
  user_agent: string | null;
};

let setupPromise: Promise<void> | null = null;

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

function normalizeCount(value: number, max?: number) {
  const boundedValue = Number.isFinite(value) ? Math.trunc(value) : 0;
  const minimumApplied = Math.max(boundedValue, 0);

  if (typeof max !== "number") {
    return minimumApplied;
  }

  return Math.min(minimumApplied, Math.max(max, 0));
}

async function ensureQuizAnalyticsStorage() {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  if (!setupPromise) {
    setupPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS husvet_quiz_devices (
          device_id text PRIMARY KEY,
          quiz_slug text NOT NULL,
          user_agent text NOT NULL DEFAULT '',
          current_index integer NOT NULL DEFAULT 0,
          total_questions integer NOT NULL DEFAULT 0,
          answered_count integer NOT NULL DEFAULT 0,
          correct_answers integer NOT NULL DEFAULT 0,
          is_complete boolean NOT NULL DEFAULT false,
          first_seen_at timestamptz NOT NULL DEFAULT now(),
          last_seen_at timestamptz NOT NULL DEFAULT now()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS husvet_quiz_devices_last_seen_idx
        ON husvet_quiz_devices (last_seen_at DESC)
      `;
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  await setupPromise;
}

export function getQuizAnalyticsStorageStatus(): QuizAnalyticsStorageStatus {
  if (process.env.DATABASE_URL) {
    return {
      configured: true,
      label: "Neon analitika",
      note: "Az eszközök és a kvíz-előrehaladás adatai a Neon adatbázisban jelennek meg.",
    };
  }

  return {
    configured: false,
    label: "Analitika kikapcsolva",
    note: "A DATABASE_URL nélkül az admin felület nem tud látogatói és kvíz-előrehaladási adatokat mutatni.",
  };
}

export async function upsertHusvetQuizDeviceProgress(
  input: HusvetQuizDeviceProgressInput,
) {
  const sql = getSqlClient();

  if (!sql) {
    return null;
  }

  const normalizedTotalQuestions = normalizeCount(input.totalQuestions);
  const normalizedAnsweredCount = normalizeCount(
    input.answeredCount,
    normalizedTotalQuestions,
  );
  const normalizedCurrentIndex = normalizeCount(
    input.currentIndex,
    normalizedTotalQuestions,
  );
  const normalizedCorrectAnswers = normalizeCount(
    input.correctAnswers,
    normalizedAnsweredCount,
  );

  await ensureQuizAnalyticsStorage();

  await sql`
    INSERT INTO husvet_quiz_devices (
      device_id,
      quiz_slug,
      user_agent,
      current_index,
      total_questions,
      answered_count,
      correct_answers,
      is_complete,
      first_seen_at,
      last_seen_at
    )
    VALUES (
      ${input.deviceId},
      ${input.quizSlug},
      ${input.userAgent},
      ${normalizedCurrentIndex},
      ${normalizedTotalQuestions},
      ${normalizedAnsweredCount},
      ${normalizedCorrectAnswers},
      ${input.isComplete},
      now(),
      now()
    )
    ON CONFLICT (device_id)
    DO UPDATE SET
      quiz_slug = EXCLUDED.quiz_slug,
      user_agent = EXCLUDED.user_agent,
      current_index = EXCLUDED.current_index,
      total_questions = EXCLUDED.total_questions,
      answered_count = EXCLUDED.answered_count,
      correct_answers = EXCLUDED.correct_answers,
      is_complete = EXCLUDED.is_complete,
      last_seen_at = now()
  `;

  return {
    answeredCount: normalizedAnsweredCount,
    correctAnswers: normalizedCorrectAnswers,
    currentIndex: normalizedCurrentIndex,
    deviceId: input.deviceId,
    isComplete: input.isComplete,
    quizSlug: input.quizSlug,
    totalQuestions: normalizedTotalQuestions,
  };
}

export async function listHusvetQuizDeviceProgress(): Promise<
  HusvetQuizDeviceProgress[]
> {
  const sql = getSqlClient();

  if (!sql) {
    return [];
  }

  await ensureQuizAnalyticsStorage();
  const rows = (await sql`
    SELECT
      device_id,
      quiz_slug,
      user_agent,
      current_index,
      total_questions,
      answered_count,
      correct_answers,
      is_complete,
      first_seen_at,
      last_seen_at
    FROM husvet_quiz_devices
    WHERE quiz_slug = 'husvet'
    ORDER BY last_seen_at DESC
  `) as QuizDeviceProgressRow[];

  return rows.map((row) => ({
    answeredCount: row.answered_count,
    correctAnswers: row.correct_answers,
    currentIndex: row.current_index,
    deviceId: row.device_id,
    firstSeenAt: row.first_seen_at,
    isComplete: row.is_complete,
    lastSeenAt: row.last_seen_at,
    quizSlug: "husvet",
    totalQuestions: row.total_questions,
    userAgent: row.user_agent ?? "",
  }));
}
