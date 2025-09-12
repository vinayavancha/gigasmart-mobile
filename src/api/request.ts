import type { AxiosResponse } from "axios";
import { ApiError } from "../types/http";
import { Result, err, ok } from "../types/result";
import { toApiError } from "../utils/errors";

export async function request<T>(
  fn: () => Promise<AxiosResponse<T>>
): Promise<Result<T, ApiError>> {
  try {
    const res = await fn();
    return ok(res.data); // ✅ Ok branch is compatible with Result<T, ApiError>
  } catch (e) {
    return err(toApiError(e)); // ✅ Err branch is ApiError
  }
}
