import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required for migrations.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const databaseDirectory = new URL("../database/", import.meta.url);
const files = (await readdir(databaseDirectory)).filter((name) => /^\d{3}_.+\.sql$/.test(name)).sort();

for (const file of files) {
  const version = file.replace(/\.sql$/, "");
  const tableExists = await sql.query("SELECT to_regclass('public.content_migrations')::text AS name");
  if (tableExists[0]?.name) {
    const applied = await sql.query("SELECT 1 FROM content_migrations WHERE version=$1", [version]);
    if (applied.length) {
      console.log(`Skipped migration ${version} (already applied).`);
      continue;
    }
  }

  const source = await readFile(new URL(file, databaseDirectory), "utf8");
  const statements = source.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  console.log(`Applied migration ${version} (${statements.length} statements).`);
}
