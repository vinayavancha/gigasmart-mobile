import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function test() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.logo}
          />
          <Text variant="headlineMedium" style={styles.company}>
            Gigasmart
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
          Sign in to your account
        </Text>
      </View>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" style={styles.button}>
        Login
      </Button>

      <Text style={styles.footerText}>
        Don't have an account?{" "}
        <Text style={{ color: theme.colors.primary }}>Sign up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  footerText: {
    marginTop: 16,
    textAlign: "center",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginBottom: 6,
  },
  company: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});
