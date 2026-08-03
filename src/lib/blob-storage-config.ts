export type BlobStorageEnvironment = {
  BLOB_READ_WRITE_TOKEN?: string;
  BLOB_STORE_ID?: string;
  VERCEL_OIDC_TOKEN?: string;
  VERCEL_ENV?: string;
  NODE_ENV?: string;
};

export type BlobStorageAuth =
  | { kind: "token"; token: string }
  | { kind: "oidc"; storeId: string }
  | { kind: "database" };

function value(environmentValue: string | undefined) {
  const trimmed = environmentValue?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveBlobStorageAuth(
  environment: BlobStorageEnvironment = process.env as BlobStorageEnvironment,
): BlobStorageAuth {
  const token = value(environment.BLOB_READ_WRITE_TOKEN);
  if (token) return { kind: "token", token };

  const storeId = value(environment.BLOB_STORE_ID);
  if (storeId) return { kind: "oidc", storeId };

  return { kind: "database" };
}

export function blobAuthOptions(auth: Exclude<BlobStorageAuth, { kind: "database" }>) {
  return auth.kind === "token" ? { token: auth.token } : { storeId: auth.storeId };
}

export function isBlobStorageConfigured(
  environment: BlobStorageEnvironment = process.env as BlobStorageEnvironment,
) {
  return resolveBlobStorageAuth(environment).kind !== "database";
}

export function isProductionRuntime(
  environment: BlobStorageEnvironment = process.env as BlobStorageEnvironment,
) {
  return environment.VERCEL_ENV === "production" || environment.NODE_ENV === "production";
}

export function resolvePdfStorageAuth(
  environment: BlobStorageEnvironment = process.env as BlobStorageEnvironment,
) {
  const auth = resolveBlobStorageAuth(environment);
  if (auth.kind === "database" && isProductionRuntime(environment)) {
    throw new Error("A PDF nem tárolható: a Vercel Blob nincs beállítva az éles környezetben.");
  }
  return auth;
}
