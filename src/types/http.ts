export type ErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  status?: number;
  code: ErrorCode;
  details?: unknown;
  constructor(
    message: string,
    opts?: { status?: number; code?: ErrorCode; details?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.code = opts?.code ?? "UNKNOWN";
    this.details = opts?.details;
  }
}
