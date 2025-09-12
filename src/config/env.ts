import Constants from "expo-constants";

// Android emulator can't reach "localhost" of your API.
// Use 10.0.2.2 for Android emulator; adjust for iOS simulator as needed.
const API_URL =
  Constants.expoConfig?.extra?.API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://192.168.3.4:5120/api";

export const ENV = {
  API_URL,
  TIMEOUT_MS: 15000,
};
