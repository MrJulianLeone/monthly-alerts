import { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { api, ApiError, API_URL, setToken } from "../../lib/api";
import { lbToKg } from "../../lib/units";
import { Button, Card, ErrorText, FieldLabel, Heading, Input, Subtext } from "../../components/ui";
import { colors, spacing } from "../../lib/theme";

type Session = {
  user: {
    email: string;
    role: string | null;
    date_of_birth: string | null;
    parent_id: string | null;
    display_name: string | null;
    goal: string | null;
    weight_kg: string | null;
    current_streak: number | null;
    longest_streak: number | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
  } | null;
};

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session["user"]>(null);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api<Session>("/api/auth/session")
        .then((d) => setSession(d.user))
        .catch(() => {});
    }, [])
  );

  async function saveWeight() {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api("/api/profile", { method: "PATCH", body: { weightKg: lbToKg(Number(weight)) } });
      setSaved(true);
      setWeight("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function sendFamilyInvite() {
    setInviteBusy(true);
    setInviteError("");
    setInviteSent(false);
    try {
      await api("/api/invites/family", { body: { email: inviteEmail.trim() } });
      setInviteSent(true);
      setInviteEmail("");
    } catch (e) {
      setInviteError(e instanceof ApiError ? e.message : "Could not send the invite");
    } finally {
      setInviteBusy(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => {});
    await setToken(null);
    router.replace("/onboarding");
  }

  const trialActive = session?.trial_ends_at && new Date(session.trial_ends_at) > new Date();
  const age = session?.date_of_birth ? ageFromDob(session.date_of_birth) : null;
  const isAdult =
    session?.role === "parent" ||
    session?.role === "admin" ||
    (age !== null && age >= 18);
  const needsParent = !!session && !isAdult && session.parent_id === null;
  const showInvite = isAdult || needsParent;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Heading>Settings</Heading>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.name}>{session?.display_name ?? "—"}</Text>
          <Text style={styles.meta}>{session?.email ?? ""}</Text>
          <Text style={styles.meta}>
            Goal: {session?.goal?.replace(/_/g, " ") ?? "not set"} · Streak:{" "}
            {session?.current_streak ?? 0}d (best {session?.longest_streak ?? 0}d)
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <Text style={styles.meta}>
            {session?.subscription_status === "active"
              ? "Active — thanks for being a member."
              : trialActive
                ? `Free trial until ${new Date(session!.trial_ends_at!).toLocaleDateString()}.`
                : "Trial ended — subscribe to keep your coaching going."}
          </Text>
          {session?.subscription_status !== "active" && (
            <Button
              title="Manage subscription"
              variant="secondary"
              onPress={() => Linking.openURL(`${API_URL}/subscribe`)}
              style={{ marginTop: spacing.md }}
            />
          )}
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Log today&apos;s weight</Text>
          <Text style={styles.meta}>
            Optional — weight trends appear in your monthly summary.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <FieldLabel>Weight (lbs)</FieldLabel>
            <Input keyboardType="numeric" value={weight} onChangeText={setWeight} />
            <ErrorText>{error}</ErrorText>
            {saved && <Text style={styles.saved}>Saved.</Text>}
            <Button
              title="Save weight"
              onPress={saveWeight}
              loading={busy}
              disabled={!weight || isNaN(Number(weight))}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </Card>

        {showInvite && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>
              {needsParent ? "Invite a parent" : "Invite family"}
            </Text>
            <Subtext>
              {needsParent
                ? "Since you're under 16, invite a parent or guardian by email. When they accept, they become your parent and can oversee your account."
                : "Invite a family member to start their own MonthlyAlerts coaching."}
            </Subtext>
            <View style={{ marginTop: spacing.md }}>
              <FieldLabel>{needsParent ? "Parent's email" : "Family member's email"}</FieldLabel>
              <Input
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="name@example.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
              />
              <ErrorText>{inviteError}</ErrorText>
              {inviteSent && <Text style={styles.saved}>Invite sent.</Text>}
              <Button
                title="Send invite"
                onPress={sendFamilyInvite}
                loading={inviteBusy}
                disabled={!inviteEmail.includes("@")}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </Card>
        )}

        <Button
          title="Log out"
          variant="secondary"
          onPress={logout}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  name: { color: colors.text, fontSize: 18, fontWeight: "600" },
  meta: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  saved: { color: colors.success, fontSize: 14, marginTop: spacing.sm },
});
