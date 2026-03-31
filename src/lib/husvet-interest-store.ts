import { neon } from "@neondatabase/serverless";

export type HusvetInterestContactInput = {
  source: "quiz" | "timeline";
  name: string;
  contact: string;
  note: string;
};

type InterestContactRow = {
  created_at: string;
};

let setupPromise: Promise<void> | null = null;

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

async function ensureInterestStorage() {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  if (!setupPromise) {
    setupPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS husvet_interest_contacts (
          id bigserial PRIMARY KEY,
          source text NOT NULL,
          name text NOT NULL DEFAULT '',
          contact text NOT NULL,
          note text NOT NULL DEFAULT '',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  await setupPromise;
}

export async function saveHusvetInterestContact(
  input: HusvetInterestContactInput,
) {
  const sql = getSqlClient();

  if (!sql) {
    throw new Error(
      "A kapcsolatfelvétel most nem érhető el, mert a DATABASE_URL nincs beállítva.",
    );
  }

  await ensureInterestStorage();
  const rows = (await sql`
    INSERT INTO husvet_interest_contacts (source, name, contact, note, created_at)
    VALUES (
      ${input.source},
      ${input.name},
      ${input.contact},
      ${input.note},
      now()
    )
    RETURNING created_at
  `) as InterestContactRow[];

  return {
    createdAt: rows[0]?.created_at ?? new Date().toISOString(),
  };
}
