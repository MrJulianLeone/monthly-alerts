import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, ApiError, setToken } from "../../lib/api";
import { Button, ErrorText, Heading, Input, Subtext } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

/**
 * Zero-signup welcome screen: a coach greeting and a text box. Starting the
 * chat provisions a guest account (no email, no password) via /api/auth/guest;
 * the returned token is stored securely so the user is remembered on this
 * device. Existing accounts can still log in.
 */
export default function Welcome() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      let timezone = "UTC";
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        // Keep UTC if the runtime can't resolve a timezone.
      }
      const result = await api<{ token?: string }>("/api/auth/guest", {
        body: { message: message.trim() || undefined, timezone },
      });
      if (result.token) await setToken(result.token);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not start the chat. Try again.");
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
        <Text style={styles.brand}>MONTHLYALERTS</Text>
        <Heading>Your personal health coach.</Heading>
        <Subtext>
          Daily meal and exercise guidance, plus a monthly progress summary. No
          sign-up needed — you&apos;re remembered on this device.
        </Subtext>

        {/* Coach welcome bubble */}
        <View style={styles.coachRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Hi, I&apos;m your coach. Say hello or tell me what you want to work
              on, and we&apos;ll get started right away.
            </Text>
          </View>
        </View>

        <Input
          value={message}
          onChangeText={setMessage}
          maxLength={500}
          placeholder="Say hi or share a goal…"
          style={{ marginTop: spacing.md }}
        />
        <ErrorText>{error}</ErrorText>
        <Button
          title={busy ? "Starting…" : "Start chatting"}
          onPress={start}
          loading={busy}
          style={{ marginTop: spacing.md }}
        />
        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => router.push("/onboarding/login")}
          style={styles.login}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  brand: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  coachRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: { color: colors.primaryText, fontSize: 14, fontWeight: "600" },
  bubble: {
    backgroundColor: colors.coachBubble,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  login: { backgroundColor: "transparent", borderWidth: 0, marginTop: spacing.lg },
});
