---
phase: 03
plan: 31
status: completed
completed: 2026-08-03
---

# 03-31 Summary: Fix Vercel Blob PDF storage

- Replaced the environment-only Blob gate with explicit credential routing.
  A configured read-write token is passed directly so SDK OIDC precedence
  cannot override it; OIDC-only deployments are accepted from `BLOB_STORE_ID`
  and let the SDK retrieve the short-lived request-context token.
- Production PDF uploads without either supported Blob path now fail with a
  configuration error instead of silently writing the binary to Postgres.
  Storage/finalization failures also emit structured server-side diagnostics.
- Blob reads and deletes use the same explicit routing as uploads.
- Added a guarded `db:migrate-pdf-blobs` command. It validates the database
  byte count and checksum, uploads privately, downloads the Blob again, verifies
  the same checksum, and only then conditionally switches the database row to
  Blob and clears `file_data`.

## Verification

- All 53 focused tests passed, including five Blob routing regressions.
- ESLint, strict TypeScript, production build, GTD verification, and repository
  health passed.
- A real private-Blob probe uploaded, read back, checksum-verified, and deleted
  a 64,339-byte PDF using the corrected explicit-token path. The store returned
  to zero objects afterward.
- Commit `f55cb6c` was pushed to `main`; the connected Vercel deployment reached
  success for that exact commit before migration began.
- The guarded migration found and migrated exactly one document. Document
  `8d15afcc-2456-40da-b1c8-224adcd9f86c` is now `storage_kind = 'blob'`, its
  `file_data` is null, and its private object is 75,525 bytes with the original
  SHA-256 `7479188792bc75b8bdcc02d93a48a9034594e67b51075ea4bfe2bd6005bc3f4f`.
- Post-migration Blob listing contains exactly that one study PDF. Direct Blob
  read-back and `https://www.eloviz.hu/api/documents/8d15afcc-2456-40da-b1c8-224adcd9f86c`
  both returned 75,525 bytes with the same checksum; the live route remained
  HTTP 200 with `application/pdf`.

---
*Completed: 2026-08-03*
