type BlobStorageEnvironment = {
  BLOB_READ_WRITE_TOKEN?: string;
  BLOB_STORE_ID?: string;
  VERCEL_OIDC_TOKEN?: string;
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function isBlobStorageConfigured(
  environment: BlobStorageEnvironment = process.env as BlobStorageEnvironment,
) {
  const hasLegacyToken = hasValue(environment.BLOB_READ_WRITE_TOKEN);
  const hasOidcCredentials =
    hasValue(environment.BLOB_STORE_ID) && hasValue(environment.VERCEL_OIDC_TOKEN);

  return hasLegacyToken || hasOidcCredentials;
}
