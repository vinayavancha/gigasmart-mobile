// app/login.tsx
import { login } from "@/services/auth/authService";
import { router } from "expo-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ----------------------------- Design tokens ----------------------------- */
const COLORS = {
  primary: "#007AFF",
  border: "#D1D5DB",
  surface: "#F9FAFB",
  text: "#1F2937",
  subtle: "#6B7280",
  error: "#EF4444",
  white: "#FFFFFF",
};
const RADIUS = { md: 12, lg: 16 };
const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

/* --------------------------------- Screen -------------------------------- */
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState("");

  const scale = useRef(new Animated.Value(1)).current;

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (loading) return;
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const res = await login(email, password);
      if (!res.ok) {
        console.log("Login error:", res);
        setServerError(
          res?.error?.message || "Login failed. Please try again."
        );
        return;
      }
      router.replace("/dashboard");
    } catch (e: any) {
      setServerError(e?.message || "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kb}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image
                source={require("@/assets/images/logo.jpg")}
                style={styles.logo}
              />
              <Text style={styles.company}>Gigasmart</Text>
            </View>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Top server error (fixed height to avoid flicker) */}
          <Text style={[styles.serverError, !serverError && { opacity: 0 }]}>
            {serverError || "placeholder"}
          </Text>

          {/* Form card */}
          <View style={styles.card}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <AppInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                returnKeyType="next"
                error={errors.email}
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                error={errors.password}
              />

              <View style={{ alignItems: "flex-end", marginTop: -SPACE.xs }}>
                <Text
                  style={styles.link}
                  onPress={() => router.push("/forgot-password")}
                >
                  Forgot your password?
                </Text>
              </View>

              <AppButton
                title="Sign In"
                loading={loading}
                onPress={onSubmit}
                right={<ArrowRight size={18} color="#FFFFFF" />}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* -------------------------- Reusable UI (inline) -------------------------- */
function AppInput({
  label,
  error,
  secure,
  style,
  ...rest
}: {
  label?: string;
  error?: string;
  secure?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  const [show, setShow] = useState(!secure);
  return (
    <View style={{ marginBottom: SPACE.sm }}>
      {!!label && <Text style={ui.label}>{label}</Text>}
      <View style={[ui.inputWrap, !!error && ui.inputWrapError]}>
        <TextInput
          {...rest}
          placeholderTextColor="#9CA3AF"
          style={[ui.input, style]}
          secureTextEntry={!!secure && !show}
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} style={ui.eye}>
            {show ? (
              <EyeOff size={20} color={COLORS.subtle} />
            ) : (
              <Eye size={20} color={COLORS.subtle} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* Reserve space to prevent layout jump */}
      <Text style={[ui.error, !error && { opacity: 0 }]}>{error || " "}</Text>
    </View>
  );
}

function AppButton({
  title,
  loading,
  disabled,
  right,
  onPress,
}: {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  right?: React.ReactNode;
  onPress: () => void;
}) {
  const isDisabled = !!loading || !!disabled;
  return (
    <TouchableOpacity
      style={[ui.btn, isDisabled && ui.btnDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <View style={ui.btnRow}>
          <Text style={ui.btnText}>{title}</Text>
          {right}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ---------------------------------- Styles --------------------------------- */
const styles = StyleSheet.create({
  kb: { flex: 1, justifyContent: "center", paddingHorizontal: SPACE.xl },
  header: { alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs },
  logoWrap: { alignItems: "center", gap: SPACE.xs + 2 },
  logo: { width: 48, height: 48, borderRadius: 10 },
  company: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: COLORS.subtle, textAlign: "center" },
  serverError: {
    alignSelf: "center",
    color: COLORS.error,
    fontSize: 14,
    minHeight: 18,
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACE.xl,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: "500" },
});

const ui = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 2,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapError: { borderColor: COLORS.error, backgroundColor: "#FEF2F2" },
  input: { flex: 1, fontSize: 16, color: COLORS.text, padding: 0 },
  eye: { paddingLeft: 6, paddingVertical: 2 },
  error: {
    fontSize: 13,
    color: COLORS.error,
    marginLeft: 2,
    marginTop: 4,
    minHeight: 18,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: SPACE.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDisabled: { backgroundColor: "#9CA3AF", shadowOpacity: 0 },
  btnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
