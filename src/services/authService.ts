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

  const { accessToken, refreshToken } = res.value;

  if (!accessToken || !refreshToken) {
    return err(new ApiError("Invalid login response.", { code: "UNKNOWN" }));
  }

  await tokenStorage.setItem(ACCESS, accessToken);
  await tokenStorage.setItem(REFRESH, refreshToken);

  return ok(res.value);
}

/** Refresh access token (handles rotation if API returns a new refreshToken) */
export async function refresh(): Promise<
  Result<AuthRefreshResponse, ApiError>
> {
  const refreshToken = await tokenStorage.getItem(REFRESH);
  if (!refreshToken) {
    return err(
      new ApiError("Missing refresh token.", { code: "UNAUTHORIZED" })
    );
  }

  const res = await request<AuthRefreshResponse>(() =>
    api.post("/auth/refresh", { refreshToken } as AuthRefreshRequest)
  );
  if (!res.ok) return res;

  await tokenStorage.setItem(ACCESS, res.value.accessToken);
  if (res.value.accessToken) {
    await tokenStorage.setItem(REFRESH, res.value.refreshToken);
  }
  return res;
}

/** Logout (best-effort server call) → always clears local tokens */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await tokenStorage.getItem(REFRESH);
    if (refreshToken) {
      await request(() => api.post("/auth/logout", { refreshToken }));
    }
  } finally {
    await tokenStorage.multiRemove([ACCESS, REFRESH]);
  }
}
