import { neon } from "@neondatabase/serverless";
import {
  defaultHusvetQuizContent,
  parseHusvetQuizContentInput,
  type HusvetQuizContent,
  type HusvetQuizContentInput,
} from "@/lib/husvet-quiz";

type QuizStorageStatus = {
  configured: boolean;
  label: string;
  note: string;
};

type QuizRow = {
  title: string;
  intro: string;
  questions: unknown;
  updated_at: string | null;
};

const QUIZ_KEY = "husvet";
let setupPromise: Promise<void> | null = null;

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

async function ensureQuizStorage() {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  if (!setupPromise) {
    setupPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS quiz_content (
          quiz_key text PRIMARY KEY,
          title text NOT NULL,
          intro text NOT NULL,
          questions jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;

      await sql`
        INSERT INTO quiz_content (quiz_key, title, intro, questions)
        VALUES (
          ${QUIZ_KEY},
          ${defaultHusvetQuizContent.title},
          ${defaultHusvetQuizContent.intro},
          ${JSON.stringify(defaultHusvetQuizContent.questions)}::jsonb
        )
        ON CONFLICT (quiz_key) DO NOTHING
      `;
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  await setupPromise;
}

function coerceQuestions(rawQuestions: unknown) {
  if (typeof rawQuestions === "string") {
    try {
      return JSON.parse(rawQuestions);
    } catch {
      return [];
    }
  }

  return rawQuestions;
}

export function getQuizStorageStatus(): QuizStorageStatus {
  if (process.env.DATABASE_URL) {
    return {
      configured: true,
      label: "Neon adatbázis",
      note: "A kérdések mentése tartósan a Neon adatbázisba kerül.",
    };
  }

  return {
    configured: false,
    label: "Alapértelmezett tartalom",
    note: "A DATABASE_URL nincs beállítva, ezért a felület csak a beépített alapértelmezett kérdéseket tudja megjeleníteni.",
  };
}

export async function getHusvetQuizContent(): Promise<HusvetQuizContent> {
  const sql = getSqlClient();

  if (!sql) {
    return defaultHusvetQuizContent;
  }

  await ensureQuizStorage();
  const rows = (await sql`
    SELECT title, intro, questions, updated_at
    FROM quiz_content
    WHERE quiz_key = ${QUIZ_KEY}
    LIMIT 1
  `) as QuizRow[];

  const row = rows[0];

  if (!row) {
    return defaultHusvetQuizContent;
  }

  const parsed = parseHusvetQuizContentInput({
    title: row.title,
    intro: row.intro,
    questions: coerceQuestions(row.questions),
  });

  if (!parsed.success) {
    return defaultHusvetQuizContent;
  }

  return {
    slug: "husvet",
    ...parsed.data,
    updatedAt: row.updated_at,
  };
}

export async function saveHusvetQuizContent(content: HusvetQuizContentInput) {
  const sql = getSqlClient();

  if (!sql) {
    throw new Error("A DATABASE_URL nincs beállítva.");
  }

  await ensureQuizStorage();
  const rows = (await sql`
    INSERT INTO quiz_content (quiz_key, title, intro, questions, updated_at)
    VALUES (
      ${QUIZ_KEY},
      ${content.title},
      ${content.intro},
      ${JSON.stringify(content.questions)}::jsonb,
      now()
    )
    ON CONFLICT (quiz_key)
    DO UPDATE SET
      title = EXCLUDED.title,
      intro = EXCLUDED.intro,
      questions = EXCLUDED.questions,
      updated_at = now()
    RETURNING title, intro, questions, updated_at
  `) as QuizRow[];

  const row = rows[0];

  return {
    slug: "husvet" as const,
    ...content,
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}
