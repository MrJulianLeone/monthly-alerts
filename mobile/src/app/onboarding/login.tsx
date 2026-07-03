import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { api, ApiError, setToken } from "../../lib/api";
import { Button, ErrorText, FieldLabel, Heading, Input } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string }>("/api/auth/login", {
        body: { email: email.trim(), password },
      });
      await setToken(result.token);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Heading>Welcome back</Heading>
        <View style={styles.form}>
          <FieldLabel>Email</FieldLabel>
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FieldLabel>Password</FieldLabel>
          <Input secureTextEntry value={password} onChangeText={setPassword} />
          <ErrorText>{error}</ErrorText>
          <Button
            title="Log in"
            onPress={login}
            loading={busy}
            disabled={!email.includes("@") || !password}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  form: { gap: spacing.xs, marginTop: spacing.lg },
});
