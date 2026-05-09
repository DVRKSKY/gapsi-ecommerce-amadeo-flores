import "server-only";

export type WalmartCredentials = {
  key: string;
  host: string;
  baseUrl: string;
};

export function readWalmartCredentials(): WalmartCredentials | null {
  const key = process.env.RAPIDAPI_KEY?.trim();
  const host = process.env.RAPIDAPI_HOST?.trim();
  const baseUrl = process.env.WALMART_API_URL?.trim();

  if (!key || !host || !baseUrl) {
    return null;
  }

  return { key, host, baseUrl };
}

export function walmartAxessoHeaders(creds: WalmartCredentials): HeadersInit {
  return {
    "X-RapidAPI-Key": creds.key,
    "X-RapidAPI-Host": creds.host,
    Accept: "application/json",
  };
}
