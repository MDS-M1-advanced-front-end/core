export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };
