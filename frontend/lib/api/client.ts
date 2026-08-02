import type { ApiEnvelope, ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

interface ErrorEnvelope {
  success: false;
  error: { code: string; message: string };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401) {
    onUnauthorized?.();
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = body as ErrorEnvelope | null;
    const error: ApiError = {
      message: errorBody?.error?.message ?? "Something went wrong",
      status: res.status,
      code: errorBody?.error?.code ?? "UNKNOWN_ERROR",
    };
    throw error;
  }

  return (body as ApiEnvelope<T>).data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
