import api from "@/api/client";
import { request } from "@/api/request";
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRefreshRequest,
  AuthRefreshResponse,
} from "@/dtos/auth";
import { ApiError } from "@/types/http";
import { Result, err, ok } from "@/types/result";
import { ACCESS, REFRESH, tokenStorage } from "@/utils/tokenStorage";

/** Login → stores tokens, returns payload (incl. optional user) */
export async function login(
  email: string,
  password: string
): Promise<Result<AuthLoginResponse, ApiError>> {
  if (!email?.trim() || !password?.trim()) {
    return err(
      new ApiError("Email and password are required.", {
        code: "VALIDATION_ERROR",
      })
    );
  }

  const res = await request<AuthLoginResponse>(() =>
    api.post("/auth/login", { email, password } as AuthLoginRequest)
  );

  if (!res.ok) return res;

  const { access_token, refresh_token } = res.value;
  if (!access_token || !refresh_token) {
    return err(new ApiError("Invalid login response.", { code: "UNKNOWN" }));
  }

  await tokenStorage.setItem(ACCESS, access_token);
  await tokenStorage.setItem(REFRESH, refresh_token);
  return ok(res.value);
}

/** Refresh access token (handles rotation if API returns a new refresh_token) */
export async function refresh(): Promise<
  Result<AuthRefreshResponse, ApiError>
> {
  const refresh_token = await tokenStorage.getItem(REFRESH);
  if (!refresh_token) {
    return err(
      new ApiError("Missing refresh token.", { code: "UNAUTHORIZED" })
    );
  }

  const res = await request<AuthRefreshResponse>(() =>
    api.post("/auth/refresh", { refresh_token } as AuthRefreshRequest)
  );
  if (!res.ok) return res;

  await tokenStorage.setItem(ACCESS, res.value.access_token);
  if (res.value.refresh_token) {
    await tokenStorage.setItem(REFRESH, res.value.refresh_token);
  }
  return res;
}

/** Logout (best-effort server call) → always clears local tokens */
export async function logout(): Promise<void> {
  try {
    const refresh_token = await tokenStorage.getItem(REFRESH);
    if (refresh_token) {
      await request(() => api.post("/auth/logout", { refresh_token }));
    }
  } finally {
    await tokenStorage.multiRemove([ACCESS, REFRESH]);
  }
}
