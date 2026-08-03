import assert from "node:assert/strict";
import test from "node:test";
import {
  blobAuthOptions,
  isBlobStorageConfigured,
  isProductionRuntime,
  resolveBlobStorageAuth,
  resolvePdfStorageAuth,
} from "./blob-storage-config.ts";

test("selects and explicitly passes a legacy read-write token", () => {
  const auth = resolveBlobStorageAuth({
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_example",
    BLOB_STORE_ID: "store_example",
  });

  if (auth.kind === "database") assert.fail("Expected Blob authentication");
  assert.deepEqual(auth, { kind: "token", token: "vercel_blob_rw_example" });
  assert.deepEqual(blobAuthOptions(auth), { token: "vercel_blob_rw_example" });
});

test("accepts a store ID for request-context OIDC without an environment token", () => {
  const auth = resolveBlobStorageAuth({
    BLOB_READ_WRITE_TOKEN: undefined,
    BLOB_STORE_ID: "store_example",
    VERCEL_OIDC_TOKEN: undefined,
  });

  if (auth.kind === "database") assert.fail("Expected Blob authentication");
  assert.deepEqual(auth, { kind: "oidc", storeId: "store_example" });
  assert.deepEqual(blobAuthOptions(auth), { storeId: "store_example" });
  assert.equal(isBlobStorageConfigured({ BLOB_STORE_ID: "store_example" }), true);
});

test("keeps the database fallback only when neither Blob credential path exists", () => {
  const incompleteEnvironments = [
    {},
    { VERCEL_OIDC_TOKEN: "oidc-without-store" },
    {
      BLOB_READ_WRITE_TOKEN: "   ",
      BLOB_STORE_ID: "   ",
      VERCEL_OIDC_TOKEN: "   ",
    },
  ];

  for (const environment of incompleteEnvironments) {
    assert.deepEqual(resolveBlobStorageAuth(environment), { kind: "database" });
    assert.equal(isBlobStorageConfigured(environment), false);
  }
});

test("identifies Vercel and generic production runtimes", () => {
  assert.equal(isProductionRuntime({ VERCEL_ENV: "production" }), true);
  assert.equal(isProductionRuntime({ NODE_ENV: "production" }), true);
  assert.equal(isProductionRuntime({ VERCEL_ENV: "preview", NODE_ENV: "production" }), true);
  assert.equal(isProductionRuntime({ VERCEL_ENV: "development", NODE_ENV: "development" }), false);
  assert.equal(isProductionRuntime({}), false);
});

test("rejects the silent database fallback in production", () => {
  assert.throws(
    () => resolvePdfStorageAuth({ VERCEL_ENV: "production" }),
    /Vercel Blob nincs beállítva/,
  );
  assert.deepEqual(resolvePdfStorageAuth({ NODE_ENV: "development" }), { kind: "database" });
});
