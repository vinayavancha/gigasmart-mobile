import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { Platform } from "react-native";

if (Platform.OS === "web") {
  throw new Error("Secure storage is only available on iOS/Android.");
}

export const ACCESS = "accessToken";
export const REFRESH = "refreshToken";

type JwtPayload = { exp?: number };

export async function setItem(key: string, value: string | null) {
  try {
    if (!value) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    console.log("setItem", value);
    await SecureStore.setItemAsync(key, value);
    // await SecureStore.setItemAsync(key, value, {
    //   keychainService: "com.gigasmart.tokens",
    //   keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    // });
  } catch (err) {
    console.error(`tokenStorage.setItem(${key}) failed:`, err);
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.error(`tokenStorage.getItem(${key}) failed:`, err);
    return null;
  }
}

export async function removeItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.error(`tokenStorage.removeItem(${key}) failed:`, err);
  }
}

export async function multiRemove(keys: string[]) {
  await Promise.allSettled(keys.map((k) => removeItem(k)));
}

export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token) || {};
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export async function getAccessToken() {
  return getItem(ACCESS);
}
export async function getRefreshToken() {
  return getItem(REFRESH);
}
export async function hasValidAccessToken() {
  const t = await getAccessToken();
  return !!t && !isTokenExpired(t);
}

export const tokenStorage = {
  setItem,
  getItem,
  removeItem,
  multiRemove,
  isTokenExpired,
  getAccessToken,
  getRefreshToken,
  hasValidAccessToken,
};
