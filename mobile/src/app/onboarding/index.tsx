import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ErrorText, FieldLabel, Heading, Input, Subtext } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Onboarding entry point: name + birthday. The system routes by age —
 * under 16 goes to the parent-email path, 16+ continues to self-signup.
 */
export default function Welcome() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [tooYoung, setTooYoung] = useState(false);

  const validDob = /^\d{4}-\d{2}-\d{2}$/.test(dob) && !isNaN(Date.parse(dob));

  function next() {
    setError("");
    const age = ageFromDob(dob);
    if (age < 0 || age > 120) {
      setError("Please check the date of birth");
      return;
    }
    if (age < 11) {
      setTooYoung(true);
      return;
    }
    const params = { name: name.trim(), dob };
    if (age < 16) router.push({ pathname: "/onboarding/parent-email", params });
    else router.push({ pathname: "/onboarding/signup", params });
  }

  if (tooYoung) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.brand}>MONTHLYALERTS</Text>
          <Heading>See you soon</Heading>
          <Subtext>
            MonthlyAlerts supports ages 11 and up. We&apos;d love to be your coach when
            you&apos;re a little older.
          </Subtext>
          <Button
            title="Back"
            variant="secondary"
            onPress={() => setTooYoung(false)}
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.brand}>MONTHLYALERTS</Text>
        <Heading>Let&apos;s get started</Heading>
        <Subtext>
          Your personal health coach: daily meal and exercise guidance, and a monthly progress
          summary. Tell us your name and birthday to begin.
        </Subtext>
        <View style={styles.form}>
          <FieldLabel>Your name</FieldLabel>
          <Input placeholder="Alex" value={name} onChangeText={setName} />
          <FieldLabel>Your birthday (YYYY-MM-DD)</FieldLabel>
          <Input
            placeholder="2010-06-15"
            autoCapitalize="none"
            value={dob}
            onChangeText={setDob}
          />
          <ErrorText>{error}</ErrorText>
          <Button
            title="Continue"
            onPress={next}
            disabled={!name.trim() || !validDob}
            style={{ marginTop: spacing.md }}
          />
        </View>
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
  form: { gap: spacing.xs, marginTop: spacing.xl },
  login: { marginTop: spacing.xl, borderWidth: 0, backgroundColor: "transparent" },
});
