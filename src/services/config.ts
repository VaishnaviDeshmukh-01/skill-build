/**
 * API configuration.
 *
 * When VITE_API_BASE_URL is set (e.g. http://localhost:8000/api) every service
 * call is proxied to the Python FastAPI backend. When it is unset the app runs
 * against the in-browser mock backend so the UI is fully demonstrable without
 * a running server. No UI component ever needs to know which mode is active.
 */
export const API_BASE_URL: string | undefined = import.meta.env["VITE_API_BASE_URL"] as
  | string
  | undefined;

export const USE_MOCK_BACKEND = !API_BASE_URL;

export const TOKEN_STORAGE_KEY = "skillbridge.token";
