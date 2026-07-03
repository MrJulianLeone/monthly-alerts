import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Heading, Subtext } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

/** Onboarding single entry point: the age gate. */
export default function AgeGate() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.brand}>MONTHLYALERTS</Text>
        <Heading>Are you 16 or older?</Heading>
        <Subtext>
          Your personal health coach: daily meal and exercise guidance, and a monthly
          progress summary.
        </Subtext>
        <View style={styles.buttons}>
          <Button title="Yes, I'm 16 or older" onPress={() => router.push("/onboarding/signup")} />
          <Button
            title="No, I'm under 16"
            variant="secondary"
            onPress={() => router.push("/onboarding/parent-email")}
          />
        </View>
        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => router.push("/onboarding/login")}
          style={styles.login}
        />
      </View>
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
  buttons: { gap: spacing.sm, marginTop: spacing.xl },
  login: { marginTop: spacing.xl, borderWidth: 0, backgroundColor: "transparent" },
});
