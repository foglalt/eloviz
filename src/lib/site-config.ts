export const SITE_URL = "https://www.eloviz.hu";

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
