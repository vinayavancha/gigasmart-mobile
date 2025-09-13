export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export class ApiError extends Error {
  public readonly status?: number;
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(
    message: string,
    options: { status?: number; code: ErrorCode; details?: any }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}
