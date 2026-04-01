import { neon } from "@neondatabase/serverless";

export type HusvetInterestContactInput = {
  source: "quiz" | "timeline";
  name: string;
  contact: string;
  note: string;
};

export type HusvetInterestContact = {
  contact: string;
  createdAt: string;
  id: string;
  name: string;
  note: string;
  source: "quiz" | "timeline";
};

export type InterestStorageStatus = {
  configured: boolean;
  label: string;
  note: string;
};

type InterestContactRow = {
  contact: string;
  created_at: string;
  id: number | string;
  name: string;
  note: string;
  source: string;
};

let setupPromise: Promise<void> | null = null;

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

function isInterestSource(value: string): value is HusvetInterestContact["source"] {
  return value === "quiz" || value === "timeline";
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

export function getInterestStorageStatus(): InterestStorageStatus {
  if (process.env.DATABASE_URL) {
    return {
      configured: true,
      label: "Neon kapcsolatok",
      note: "A kapcsolatfelvételi adatok a Neon adatbázisban jelennek meg.",
    };
  }

  return {
    configured: false,
    label: "Kapcsolatok kikapcsolva",
    note: "A DATABASE_URL nélkül a kapcsolatfelvételi adatok nem tárolhatók és az admin felületen sem jelennek meg.",
  };
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

export async function listHusvetInterestContacts(): Promise<
  HusvetInterestContact[]
> {
  const sql = getSqlClient();

  if (!sql) {
    return [];
  }

  await ensureInterestStorage();
  const rows = (await sql`
    SELECT id, source, name, contact, note, created_at
    FROM husvet_interest_contacts
    ORDER BY created_at DESC
  `) as InterestContactRow[];

  return rows.flatMap((row) => {
    if (!isInterestSource(row.source)) {
      return [];
    }

    return [
      {
        contact: row.contact,
        createdAt: row.created_at,
        id: String(row.id),
        name: row.name,
        note: row.note,
        source: row.source,
      },
    ];
  });
}
