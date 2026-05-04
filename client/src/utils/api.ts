export const API_BASE = 'http://localhost:3000';

/**
 * Thin fetch wrapper. Throws an Error with the server's message on non-2xx.
 * Automatically sets Content-Type: application/json and includes credentials
 * so cookies are forwarded.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string | string[] };
    const msg = Array.isArray(body.message)
      ? body.message[0]
      : (body.message ?? `Request failed (${res.status})`);
    throw new Error(msg);
  }

  // 204 No Content has no body
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * Decode a JWT payload without verifying the signature.
 * Used client-side to read role/sub/username from the access token.
 */
export function parseJwtPayload<T = Record<string, unknown>>(token: string): T {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)) as T;
}
