export interface ApiError {
  /** HTTP status, or 0 when no usable response was received (network failure, unreadable body). */
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };
