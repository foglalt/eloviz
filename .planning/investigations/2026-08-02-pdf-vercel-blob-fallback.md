# PDF upload storage investigation

**Date:** 2026-08-02
**Scope:** Diagnose why an uploaded PDF was stored in Postgres instead of
Vercel Blob. No application code or production data was changed.

## Finding

The issue exists. The configured database contains one uploaded
`study_documents` row:

- `storage_kind`: `database`
- `original_filename`: `A páska tipológiája.pdf`
- `byte_size`: 75,525
- `file_data`: present, 75,525 bytes
- Blob-backed document rows: 0

The row was created at `2026-07-31T17:34:50.333Z`, during the deployed PDF
worker repair workflow, and is the current document for its study.

A follow-up read-only Blob check confirmed that the connected private Blob
store is currently empty.

## Cause analysis

`src/lib/document-storage.ts` intentionally falls back to Postgres whenever
`isBlobStorageConfigured()` returns false. In that branch it returns
`storageKind: "database"` and passes the complete PDF buffer to the
`study_documents.file_data` `bytea` column.

`src/lib/blob-storage-config.ts` considers Blob configured only when either:

1. `BLOB_READ_WRITE_TOKEN` is non-empty, or
2. both `BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN` are non-empty.

Therefore the observed row proves that none of those complete **environment
variable** paths was visible to the upload function at request time. Follow-up
testing showed that the credentials and connection themselves are valid:

- `BLOB_READ_WRITE_TOKEN` and `BLOB_STORE_ID` are both present locally.
- The store ID encoded in the read-write token matches `BLOB_STORE_ID`.
- An explicit-token `@vercel/blob` list request succeeded against that store.
- The store contains zero blobs.

The primary application defect is the hand-written credential gate. Modern
`@vercel/oidc` first reads the short-lived token from the Vercel request context
header (`x-vercel-oidc-token`) and only then falls back to
`process.env.VERCEL_OIDC_TOKEN`. `isBlobStorageConfigured()` checks only
`process.env`, so a valid connected OIDC store can be misclassified as
unconfigured before `put()` is called. This exactly produces the observed
silent Postgres fallback.

There is a second credential-selection issue when both authentication modes are
available. `@vercel/blob@2.6.1` prefers an automatically obtained OIDC token
over `BLOB_READ_WRITE_TOKEN`. Locally it obtained a valid token for this linked
project, but the Blob service rejected it because the store connection does not
enable the `development` environment. Calling `list()` normally therefore
failed even though calling it with the same read-write token explicitly
succeeded. This is not evidence of a bad token; it is SDK precedence combined
with connection environment scope.

The fallback is silent and intentional. It does not log or surface that object
storage is unavailable, so an upload can succeed while placing the binary in
Postgres. Existing tests verify this fallback decision but do not perform a
real Blob upload or assert that production must use Blob.

## Verification evidence

- Read-only aggregate and recent-document queries against the configured Neon
  database confirmed one database-backed PDF and zero Blob-backed PDFs.
- `npm run test:storage` passed 3/3 tests, including the missing/partial
  credential fallback.
- With Blob credentials added to the local `.env`, the read-write token and
  configured store ID matched and an explicit-token Blob list passed.
- The default Blob list path failed with `OIDC is enabled for this project, but
  not for the "development" environment`, demonstrating that SDK OIDC
  precedence bypasses the otherwise valid legacy token locally.
- The automatically obtained non-expired OIDC token identifies the same linked
  project and team and is scoped to `development`; no token value was printed.
- The installed `@vercel/blob` package is `2.6.1` and supports the same legacy
  token and OIDC/store-ID credential paths.
- The repository is linked to Vercel project
  `prj_sYQKAUbIRhaNQrirSwKmtGJ3nNsn`, but the local Vercel CLI has no login
  credentials, so the project's Production environment-variable list and Blob
  project connection could not be inspected directly.

## Recommended next checks

1. Replace the environment-only preflight with SDK-driven authentication, or
   retrieve OIDC through `@vercel/oidc` rather than checking only
   `process.env.VERCEL_OIDC_TOKEN`.
2. If legacy-token fallback must remain, pass `BLOB_READ_WRITE_TOKEN`
   explicitly when that mode is selected so an environment-scoped automatic
   OIDC token cannot take precedence.
3. Decide whether the store should enable the Vercel `development` environment;
   it is currently not enabled. This is optional if local work deliberately
   uses the explicit legacy token.
4. Perform a small authenticated PDF upload and confirm the new row has
   `storage_kind = 'blob'`, `file_data IS NULL`, and a Blob pathname in
   `storage_key`.
5. Consider removing the silent production fallback or at least logging and
   surfacing it, so a missing Blob connection cannot go unnoticed again.
