import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { api, ApiError, setToken } from "../../lib/api";
import { Button, ErrorText, FieldLabel, Heading, Input, Subtext } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

const GOALS = [
  { value: "get_fit", label: "Get fit" },
  { value: "build_strength", label: "Build strength" },
  { value: "lose_weight", label: "Lose weight" },
  { value: "build_habits", label: "Build habits" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Text
          key={option.value}
          onPress={() => onChange(option.value === value ? "" : option.value)}
          style={[styles.chip, option.value === value && styles.chipActive]}
        >
          {option.label}
        </Text>
      ))}
    </View>
  );
}

/**
 * Self-enrollment for signed-in accounts without a coaching profile —
 * typically parents who set up a child and want to use the app themselves.
 */
export default function Enroll() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    dateOfBirth: "",
    gender: "",
    goal: "",
    weightKg: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: string) => (value: string) => setForm({ ...form, [key]: value });

  async function enroll() {
    setBusy(true);
    setError("");
    try {
      await api("/api/profile/enroll", {
        body: {
          displayName: form.displayName.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || null,
          goal: form.goal || null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      router.replace("/(tabs)");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await setToken(null);
        router.replace("/onboarding");
        return;
      }
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const valid =
    form.displayName.trim() && /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth);

  async function logout() {
    await setToken(null);
    router.replace("/onboarding");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Heading>Start your own coaching</Heading>
          <Subtext>
            Your account manages a child, and you can use MonthlyAlerts yourself too —
            daily coaching plus your own monthly summary. First 30 days free.
          </Subtext>

          <View style={styles.form}>
            <FieldLabel>Your name</FieldLabel>
            <Input value={form.displayName} onChangeText={set("displayName")} />

            <FieldLabel>Date of birth (YYYY-MM-DD)</FieldLabel>
            <Input
              placeholder="1985-06-15"
              autoCapitalize="none"
              value={form.dateOfBirth}
              onChangeText={set("dateOfBirth")}
            />

            <FieldLabel>Gender (optional)</FieldLabel>
            <Chips options={GENDERS} value={form.gender} onChange={set("gender")} />

            <FieldLabel>Goal (optional)</FieldLabel>
            <Chips options={GOALS} value={form.goal} onChange={set("goal")} />

            <FieldLabel>Weight in kg (optional)</FieldLabel>
            <Input keyboardType="numeric" value={form.weightKg} onChangeText={set("weightKg")} />

            <ErrorText>{error}</ErrorText>
            <Button
              title="Start my free month"
              onPress={enroll}
              loading={busy}
              disabled={!valid}
              style={{ marginTop: spacing.md }}
            />
            <Button
              title="Log out"
              variant="secondary"
              onPress={logout}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  form: { gap: spacing.xs, marginTop: spacing.lg },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    color: colors.textSecondary,
    fontSize: 14,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: colors.primaryText,
  },
});
