import { mkdir, writeFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const sql = neon(process.env.DATABASE_URL);
const tables = ["husvet_interest_contacts", "husvet_quiz_devices", "quiz_content"];
const backup = { createdAt: new Date().toISOString(), tables: {} };

for (const table of tables) {
  const exists = await sql.query("SELECT to_regclass($1)::text AS name", [`public.${table}`]);
  backup.tables[table] = exists[0]?.name ? await sql.query(`SELECT * FROM ${table}`) : [];
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const directory = new URL("../output/private-backups/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL(`legacy-${stamp}.json`, directory), JSON.stringify(backup, null, 2), "utf8");
console.log(`Legacy backup written locally (${Object.values(backup.tables).reduce((sum, rows) => sum + rows.length, 0)} records).`);
