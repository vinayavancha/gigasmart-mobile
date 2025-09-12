import type { AxiosError } from "axios";
import { ApiError, ErrorCode } from "../types/http";

export function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<any>;
  const status = ax?.response?.status;
  console.log("ax object all properties:", ax?.code, ax?.response, ax?.message);
  // Network / timeout
  if (ax?.code === "ECONNABORTED") {
    return new ApiError("Request timed out. Please try again.", {
      code: "TIMEOUT",
    });
  }
  if (!ax.response) {
    console.error("Network error error.ts checking:", ax?.code, ax.response);
    return new ApiError("Network error. Check your connection.", {
      code: "NETWORK_ERROR",
    });
  }

  // Known HTTP statuses
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
