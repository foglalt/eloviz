import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { get } from "@vercel/blob";
import { extractPdfDocument } from "../src/lib/pdf-extract-core.ts";
import { STUDY_ARTICLE_VERSION } from "../src/lib/study-article.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for study article backfill.");

const sql = neon(databaseUrl);
const force = process.argv.includes("--force");

type DocumentRow = {
  id: string;
  title: string;
  storage_kind: "static" | "blob" | "database";
  storage_key: string;
  file_data: unknown;
};

function databaseBuffer(value: unknown) {
  if (Buffer.isBuffer(value)) return value;
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (typeof value === "string" && value.startsWith("\\x")) return Buffer.from(value.slice(2), "hex");
  throw new Error("The database-backed PDF has no readable byte payload.");
}

async function readDocumentBuffer(document: DocumentRow) {
  if (document.storage_kind === "database") return databaseBuffer(document.file_data);

  if (document.storage_kind === "blob") {
    const result = await get(document.storage_key, { access: "private", useCache: true });
    if (!result || result.statusCode !== 200) throw new Error("The private PDF blob could not be read.");
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }

  const publicDirectory = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicDirectory, document.storage_key.replace(/^[/\\]+/, ""));
  if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    throw new Error("The static PDF path escapes the public directory.");
  }
  return readFile(filePath);
}

const documents = await sql.query(`
  SELECT d.id::text, s.title, d.storage_kind, d.storage_key, d.file_data
  FROM study_documents d
  JOIN studies s ON s.id = d.study_id
  WHERE d.extraction_status = 'complete'
    AND ($1::boolean OR d.article_content IS NULL OR d.article_extraction_version IS DISTINCT FROM $2)
  ORDER BY s.title, d.version_number
`, [force, STUDY_ARTICLE_VERSION]) as DocumentRow[];

for (const document of documents) {
  const buffer = await readDocumentBuffer(document);
  const extraction = await extractPdfDocument(buffer, document.title);
  if (!extraction.article.blocks.length) {
    throw new Error(`No article blocks were produced for document ${document.id}.`);
  }
  await sql.query(`
    UPDATE study_documents
    SET extracted_text = $2,
        article_content = $3::jsonb,
        article_extraction_version = $4
    WHERE id = $1
  `, [
    document.id,
    extraction.pages.join("\n\n"),
    JSON.stringify(extraction.article),
    STUDY_ARTICLE_VERSION,
  ]);
  console.log(`Backfilled ${document.title} (${document.id}): ${extraction.article.blocks.length} blocks.`);
}

console.log(`Study article backfill complete: ${documents.length} document(s) processed.`);
