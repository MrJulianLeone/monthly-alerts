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
import { useLocalSearchParams, useRouter } from "expo-router";
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

/** 16+ self-signup. Name and birthday carry over from the first screen. */
export default function Signup() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; dob?: string }>();
  const [form, setForm] = useState({
    displayName: params.name ? String(params.name) : "",
    email: "",
    password: "",
    dateOfBirth: params.dob ? String(params.dob) : "",
    gender: "",
    goal: "",
    weightKg: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: string) => (value: string) => setForm({ ...form, [key]: value });

  async function signup() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string }>("/api/auth/signup", {
        body: {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || null,
          goal: form.goal || null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      await setToken(result.token);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const valid =
    form.displayName.trim() &&
    form.email.includes("@") &&
    form.password.length >= 8 &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Heading>
            {form.displayName ? `Welcome, ${form.displayName.trim().split(" ")[0]}` : "Create your account"}
          </Heading>
          <Subtext>Create your login and add a few optional details for better coaching.</Subtext>

          <View style={styles.form}>
            {!params.name && (
              <>
                <FieldLabel>Name</FieldLabel>
                <Input placeholder="Alex" value={form.displayName} onChangeText={set("displayName")} />
              </>
            )}

            <FieldLabel>Email</FieldLabel>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={set("email")}
            />

            <FieldLabel>Password (8+ characters)</FieldLabel>
            <Input secureTextEntry value={form.password} onChangeText={set("password")} />

            {!params.dob && (
              <>
                <FieldLabel>Date of birth (YYYY-MM-DD)</FieldLabel>
                <Input
                  placeholder="1995-06-15"
                  autoCapitalize="none"
                  value={form.dateOfBirth}
                  onChangeText={set("dateOfBirth")}
                />
              </>
            )}

            <FieldLabel>Gender (optional)</FieldLabel>
            <Chips options={GENDERS} value={form.gender} onChange={set("gender")} />

            <FieldLabel>Goal (optional)</FieldLabel>
            <Chips options={GOALS} value={form.goal} onChange={set("goal")} />

            <FieldLabel>Weight in kg (optional)</FieldLabel>
            <Input keyboardType="numeric" value={form.weightKg} onChangeText={set("weightKg")} />

            <ErrorText>{error}</ErrorText>
            <Button
              title="Start my free month"
              onPress={signup}
              loading={busy}
              disabled={!valid}
              style={{ marginTop: spacing.md }}
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
