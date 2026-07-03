import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, ApiError } from "../../lib/api";
import { Button, ErrorText, FieldLabel, Heading, Input, Subtext } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

/** Under-16 path: child enters the parent's email; parent completes setup. */
export default function ParentEmail() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setBusy(true);
    setError("");
    try {
      await api("/api/onboarding/parent-invite", { body: { parentEmail: email.trim() } });
      setSent(true);
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
        {sent ? (
          <View>
            <Heading>Email sent</Heading>
            <Subtext>
              We sent a setup email to {email.trim()}. Once your parent finishes setup, come
              back and log in with the credentials they create for you.
            </Subtext>
          </View>
        ) : (
          <View>
            <Heading>A parent sets you up</Heading>
            <Subtext>
              Enter your parent&apos;s email. They&apos;ll get a secure link to create your account,
              fill in your profile, and set your login.
            </Subtext>
            <View style={styles.form}>
              <FieldLabel>Parent&apos;s email</FieldLabel>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="parent@example.com"
                value={email}
                onChangeText={setEmail}
              />
              <ErrorText>{error}</ErrorText>
              <Button
                title="Send setup email"
                onPress={send}
                loading={busy}
                disabled={!email.includes("@")}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  form: { marginTop: spacing.xl },
});
