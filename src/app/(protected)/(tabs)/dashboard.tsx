import api from "@/api/client";
import { tokenStorage } from "@/utils/tokenStorage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function Dashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const access = await tokenStorage.getAccessToken();
      const refresh = await tokenStorage.getRefreshToken();

      setAccessToken(access);
      setRefreshToken(refresh);
    };

    fetchTokens();
    fetchDevices();
  }, []);
  async function fetchDevices() {
    try {
      const response = await api.get("/Devices");
      console.log("Devices:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching devices:", error);
      return null;
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Dashboard23</Text>
      <Text style={styles.subtitle}>You’re logged in successfully!</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Access Token:</Text>
        <Text style={styles.token}>
          {accessToken ?? "No access token found"}
        </Text>

        <Text style={styles.title}>Refresh Token:</Text>
        <Text style={styles.token}>
          {refreshToken ?? "No refresh token found"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  token: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
  },
});
