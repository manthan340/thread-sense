const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Taxonomies = Record<string, string[]>;

export type ClosetImage = {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  category: string | null;
  color: string | null;
  season: string | null;
  occasion: string | null;
  style: string | null;
  material: string | null;
  pattern: string | null;
  formality: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
};

const TOKEN_KEY = "thread_sense_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseError(res: Response) {
  try {
    const data = await res.json();
    if (Array.isArray(data?.message)) return data.message.join(", ");
    return data?.message ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
