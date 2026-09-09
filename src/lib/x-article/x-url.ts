export type ParsedXUrl = {
  id: string;
  canonicalUrl: string;
  handle?: string;
};

const X_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);

const INVALID_URL_MESSAGE = "Paste a public X post URL.";

export function parseXStatusUrl(value: string): ParsedXUrl {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(INVALID_URL_MESSAGE);
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !X_HOSTS.has(url.hostname.toLowerCase())
  ) {
    throw new Error(INVALID_URL_MESSAGE);
  }

  const match = url.pathname.match(/^\/([a-z0-9_]{1,15})\/status\/(\d{1,25})(?:\/|$)/i);
  if (!match) {
    throw new Error(INVALID_URL_MESSAGE);
  }

  const [, handle, id] = match;
  return {
    id,
    handle,
    canonicalUrl: `https://x.com/${handle}/status/${id}`,
  };
}
