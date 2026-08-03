import { createHash } from "node:crypto";
import { del, get, put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { blobAuthOptions, resolveBlobStorageAuth } from "../src/lib/blob-storage-config.ts";

type DatabaseDocument = {
  id: string;
  study_id: string;
  original_filename: string;
  byte_size: number;
  sha256: string;
  file_data: Buffer | Uint8Array | string;
};

function asBuffer(value: DatabaseDocument["file_data"]) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  return Buffer.from(value.replace(/^\\x/, ""), "hex");
}

function checksum(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function streamBuffer(stream: ReadableStream) {
  return Buffer.from(await new Response(stream).arrayBuffer());
}

const execute = process.argv.includes("--execute");
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const auth = resolveBlobStorageAuth();
if (auth.kind === "database") {
  throw new Error("Vercel Blob credentials are required before migrating PDFs.");
}
const authOptions = blobAuthOptions(auth);
const sql = neon(databaseUrl);
const documents = await sql.query(`
  SELECT id::text, study_id::text, original_filename, byte_size, sha256, file_data
  FROM study_documents
  WHERE storage_kind = 'database' AND file_data IS NOT NULL
  ORDER BY created_at, id
`) as DatabaseDocument[];

console.log(`Database-backed PDFs found: ${documents.length}`);
if (!execute) {
  console.log("Dry run only. Re-run with --execute after the application rollout is verified.");
  process.exit(0);
}

for (const document of documents) {
  const buffer = asBuffer(document.file_data);
  if (buffer.length !== Number(document.byte_size)) {
    throw new Error(`Byte-size mismatch for document ${document.id}.`);
  }
  if (checksum(buffer) !== document.sha256) {
    throw new Error(`Database checksum mismatch for document ${document.id}.`);
  }

  const uploaded = await put(
    `studies/${document.study_id}/${document.original_filename}`,
    buffer,
    {
      access: "private",
      addRandomSuffix: true,
      contentType: "application/pdf",
      ...authOptions,
    },
  );

  try {
    const downloaded = await get(uploaded.pathname, {
      access: "private",
      useCache: false,
      ...authOptions,
    });
    if (!downloaded?.stream) throw new Error("The uploaded Blob could not be read back.");
    const verified = await streamBuffer(downloaded.stream);
    if (verified.length !== buffer.length || checksum(verified) !== document.sha256) {
      throw new Error("The uploaded Blob failed byte-size or checksum verification.");
    }

    const updated = await sql.query(`
      UPDATE study_documents
      SET storage_kind = 'blob', storage_key = $2, file_data = NULL
      WHERE id = $1 AND storage_kind = 'database' AND sha256 = $3 AND file_data IS NOT NULL
      RETURNING id::text
    `, [document.id, uploaded.pathname, document.sha256]);
    if (updated.length !== 1) {
      throw new Error("The document changed during migration; the database row was not updated.");
    }

    console.log(`Migrated and verified document ${document.id} (${buffer.length} bytes).`);
  } catch (error) {
    await del(uploaded.pathname, authOptions);
    throw error;
  }
}
