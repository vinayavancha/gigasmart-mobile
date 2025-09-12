import { ENV } from "@/config/env";
import { toApiError } from "@/utils/errors";
import { ACCESS, REFRESH, tokenStorage } from "@/utils/tokenStorage";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// add near the top of client.ts, after imports
const AUTH_PATHS = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);
const isAuthRequest = (cfg?: AxiosRequestConfig) => {
  if (!cfg?.url) return false;
  try {
    // normalize relative/absolute URLs
    const u = new URL(cfg.url, ENV.API_URL);
    return AUTH_PATHS.has(u.pathname);
  } catch {
    return cfg.url.startsWith("/auth/");
  }
};

const api = axios.create({ baseURL: ENV.API_URL, timeout: ENV.TIMEOUT_MS });

// Optional: UI redirect when refresh fails
let onUnauthorized: (() => void) | null = null;
export const setOnUnauthorized = (fn: () => void) => (onUnauthorized = fn);

// Attach bearer
api.interceptors.request.use(async (config) => {
  try {
    if (!isAuthRequest(config)) {
      const token = await tokenStorage.getAccessToken();
      if (token && !tokenStorage.isTokenExpired(token) && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error("request interceptor failed:", err);
  }
  return config;
});

// Refresh queue
let isRefreshing = false;
type Waiter = { resolve: (t: string) => void; reject: (e: any) => void };
let queue: Waiter[] = [];
const flushQueue = (error: any, token?: string) => {
  queue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error)
  );
  queue = [];
};

async function refreshAccessTokenInternal(): Promise<string> {
  const refresh_token = await tokenStorage.getRefreshToken();
  if (!refresh_token) throw new Error("Missing refresh token");

  // Use plain axios to avoid recursive interceptors
  const refreshClient = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.TIMEOUT_MS,
  });
  const { data } = await refreshClient.post("/auth/refresh", { refresh_token });

  if (!data?.access_token) throw new Error("Invalid refresh response");
  await tokenStorage.setItem(ACCESS, data.access_token);
  if (data.refresh_token)
    await tokenStorage.setItem(REFRESH, data.refresh_token);

  return data.access_token as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error?.response?.status ?? 0;
    console.log("Response error status:", status, error?.message);
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (isAuthRequest(original) || status !== 401 || original?._retry) {
      console.log(
        " isAuthRequest Response error status:",
        status,
        error?.message
      ); // Non-401 or already retried: map and reject
      return Promise.reject(toApiError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            try {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } catch (e) {
              reject(toApiError(e));
            }
          },
          reject: (e) => reject(toApiError(e)),
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessTokenInternal();
      flushQueue(null, newToken);

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      flushQueue(e);
      await tokenStorage.multiRemove([ACCESS, REFRESH]);
      onUnauthorized?.();
      return Promise.reject(toApiError(e));
    } finally {
      isRefreshing = false;
    }
  }
);

export default api; // default export
