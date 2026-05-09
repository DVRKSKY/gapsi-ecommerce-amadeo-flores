import { HttpError } from "./errors";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const isGet = method === "GET";

  const res = await fetch(path, {
    ...rest,
    cache: "no-store",
    headers: {
      ...(isGet ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown = null;
  if (text.length > 0) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new HttpError("Respuesta no es JSON válido", res.status, text);
    }
  }

  if (!res.ok) {
    throw new HttpError(res.statusText || "Request failed", res.status, data);
  }

  return data as T;
}
