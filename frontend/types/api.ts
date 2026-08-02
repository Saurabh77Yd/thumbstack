export interface ApiError {
  message: string;
  status: number;
  code: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}
