import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getBlobPdf } from "@/lib/document-storage";
import { requireSql } from "@/lib/db";
import { absoluteSiteUrl } from "@/lib/site-config";

type Props = { params: Promise<{ id: string }> };
type DocumentRow = {
  id: string;
  original_filename: string;
  storage_kind: "static" | "blob" | "database";
  storage_key: string;
  file_data: Buffer | string | null;
  is_public: boolean;
  public_study_slug: string | null;
};

function asArrayBuffer(value: Buffer) {
  return Uint8Array.from(value).buffer;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found", { status: 404 });
  const sql = requireSql();
  const rows = await sql.query(`SELECT d.id::text, d.original_filename, d.storage_kind, d.storage_key, d.file_data,
    published.slug AS public_study_slug, (published.slug IS NOT NULL) AS is_public
    FROM study_documents d
    LEFT JOIN LATERAL (
      SELECT s.slug
      FROM studies s
      WHERE s.published_document_id = d.id AND s.status = 'published'
      LIMIT 1
    ) published ON true
    WHERE d.id = $1
    LIMIT 1`, [id]) as DocumentRow[];
  const document = rows[0];
  if (!document || (!document.is_public && !(await isAdminAuthenticated()))) return new NextResponse("Not found", { status: 404 });

  let body: BodyInit;
  if (document.storage_kind === "blob") {
    const result = await getBlobPdf(document.storage_key);
    if (!result?.stream) return new NextResponse("Not found", { status: 404 });
    body = result.stream as unknown as BodyInit;
  } else if (document.storage_kind === "static") {
    const relative = document.storage_key.replace(/^\/+/, "");
    const absolute = path.resolve(process.cwd(), "public", relative);
    const allowedRoot = path.resolve(process.cwd(), "public", "studies");
    if (!absolute.startsWith(allowedRoot)) return new NextResponse("Not found", { status: 404 });
    body = asArrayBuffer(await readFile(absolute));
  } else {
    if (!document.file_data) return new NextResponse("Not found", { status: 404 });
    const buffer = Buffer.isBuffer(document.file_data) ? document.file_data : Buffer.from(document.file_data.replace(/^\\x/, ""), "hex");
    body = asArrayBuffer(buffer);
  }

  const safeName = document.original_filename.replace(/["\r\n]/g, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    "X-Robots-Tag": document.is_public ? "noindex, follow" : "noindex, nofollow",
    "Cache-Control": document.is_public ? "public, max-age=3600" : "private, no-store",
  };
  if (document.public_study_slug) {
    headers.Link = `<${absoluteSiteUrl(`/tanulmanyok/${document.public_study_slug}`)}>; rel="canonical"`;
  }

  return new NextResponse(body, { headers });
}
