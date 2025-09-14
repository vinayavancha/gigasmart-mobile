// app/login.tsx (or wherever your screen lives)
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  // Redirect after login
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace("/(protected)/(tabs)/dashboard");
    }
  }, [isAuthenticated, authLoading]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (loading) return;
    setServerError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await login(email, password);
      if (!res.success) {
        setServerError(res?.error || "Login failed. Please try again.");
      }
    } catch (e: any) {
      setServerError(e?.message || "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Auth boot screens
  if (authLoading || isAuthenticated) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 16, opacity: 0.7 }}>
          {authLoading
            ? "Checking authentication..."
            : "Redirecting to dashboard..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("@/assets/images/logo.jpg")}
                style={styles.logo}
              />
              <Text variant="headlineLarge" style={styles.company}>
                Gigasmart
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
              Sign in to your account
            </Text>
          </View>
          <TextInput
            label="Email Address"
            value={email}
            mode="outlined"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            error={!!errors.email}
            style={styles.input}
          />
          {/* <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText> */}
          <TextInput
            label="Password"
            value={password}
            mode="outlined"
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            error={!!errors.password}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((s) => !s)}
              />
            }
          />

          {/* <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText> */}
          {/* <View style={{ alignItems: "flex-end", marginTop: -4 }}>
                <Button
                  mode="text"
                  onPress={() => router.push("/forgot-password")}
                  compact
                >
                  Forgot your password?
                </Button>
              </View> */}
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 8 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Sign In
          </Button>
        </KeyboardAvoidingView>

        <Snackbar
          visible={!!serverError}
          onDismiss={() => setServerError("")}
          action={{ label: "Close", onPress: () => setServerError("") }}
          duration={4000}
        >
          {serverError}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginBottom: 6,
  },
  input: {
    marginBottom: 16,
  },
  company: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
