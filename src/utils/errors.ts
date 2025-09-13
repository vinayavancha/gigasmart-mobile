import type { AxiosError } from "axios";
import { ApiError, ErrorCode } from "../types/http";

export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;

  console.log("Full axios error object:", {
    code: ax?.code,
    response: ax?.response,
    status: ax?.response?.status,
    message: ax?.message,
    isAxiosError: ax?.isAxiosError,
  });

  // Network / timeout errors
  if (ax?.code === "ECONNABORTED") {
    return new ApiError("Request timed out. Please try again.", {
      code: "TIMEOUT",
    });
  }

  // True network errors (no response received)
  if (!ax?.response) {
    console.error(
      "Network error - no response received:",
      ax?.code,
      ax?.message
    );
    return new ApiError("Network error. Check your connection.", {
      code: "NETWORK_ERROR",
    });
  }

  // Known HTTP status errors (response received)
  const mapStatus = (s?: number): ErrorCode => {
    switch (s) {
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 422:
        return "VALIDATION_ERROR";
      case 500:
        return "SERVER_ERROR";
      default:
        return "UNKNOWN";
    }
  };

  const serverMsg =
    ax.response?.data?.message ??
    ax.response?.data?.error ??
    ax.message ??
    "Unexpected error";

  return new ApiError(String(serverMsg), {
    status,
    code: mapStatus(status),
    details: ax.response?.data,
  });
}
