export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const api = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include", ...options,
  });

  const text = await res.text();
  const json = text.length > 0 ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const error: any = new Error(json?.message ?? "API error");
    error.status = res.status;
    throw error;
  }

  return json as T;
};
