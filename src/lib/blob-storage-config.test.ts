import assert from "node:assert/strict";
import test from "node:test";
import { isBlobStorageConfigured } from "./blob-storage-config.ts";

test("enables Blob for a legacy read-write token", () => {
  assert.equal(
    isBlobStorageConfigured({
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_example",
      BLOB_STORE_ID: undefined,
      VERCEL_OIDC_TOKEN: undefined,
    }),
    true,
  );
});

test("enables Blob for a complete OIDC configuration", () => {
  assert.equal(
    isBlobStorageConfigured({
      BLOB_READ_WRITE_TOKEN: undefined,
      BLOB_STORE_ID: "store_example",
      VERCEL_OIDC_TOKEN: "oidc-example",
    }),
    true,
  );
});

test("keeps the database fallback for missing or partial credentials", () => {
  const incompleteEnvironments = [
    {
      BLOB_READ_WRITE_TOKEN: undefined,
      BLOB_STORE_ID: undefined,
      VERCEL_OIDC_TOKEN: undefined,
    },
    {
      BLOB_READ_WRITE_TOKEN: undefined,
      BLOB_STORE_ID: "store_example",
      VERCEL_OIDC_TOKEN: undefined,
    },
    {
      BLOB_READ_WRITE_TOKEN: undefined,
      BLOB_STORE_ID: undefined,
      VERCEL_OIDC_TOKEN: "oidc-example",
    },
    {
      BLOB_READ_WRITE_TOKEN: "   ",
      BLOB_STORE_ID: "   ",
      VERCEL_OIDC_TOKEN: "   ",
    },
  ];

  for (const environment of incompleteEnvironments) {
    assert.equal(isBlobStorageConfigured(environment), false);
  }
});
