import { API_BASE_URL, TOKEN_STORAGE_KEY, USE_MOCK_BACKEND } from "./config";
import { ApiError } from "./types";

export { ApiError, USE_MOCK_BACKEND };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Thin REST client used when VITE_API_BASE_URL points at the FastAPI backend. */
export async function http<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    if (res.status === 401) message = "Your session has expired. Please sign in again.";
    if (res.status === 404) message = "We couldn't find what you were looking for.";
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Simulated network latency so loading and skeleton states are exercised. */
export function mocked<T>(produce: () => T, ms = 260): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(produce());
      } catch (error) {
        reject(error instanceof Error ? error : new ApiError("Unexpected error"));
      }
    }, ms);
  });
}
