import { useCallback, useRef, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { api, API_URL, setToken } from "../../lib/api";
import { cmToFtIn, ftInToCm, lbToKg } from "../../lib/units";
import { Button, Card, ErrorText, FieldLabel, Heading, Input } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

type Session = {
  user: {
    email: string | null;
    display_name: string | null;
    goal: string | null;
    gender: string | null;
    date_of_birth: string | null;
    height_cm: string | null;
    weight_kg: string | null;
    current_streak: number | null;
    longest_streak: number | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
  } | null;
};

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

export default function SettingsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session["user"]>(null);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // "About you" — goals and demographics (all optional, guests start empty).
  const [profile, setProfile] = useState({
    displayName: "",
    goal: "",
    gender: "",
    dateOfBirth: "",
    heightFt: "",
    heightIn: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const prefilled = useRef(false);

  const setField = (key: string) => (value: string) =>
    setProfile((p) => ({ ...p, [key]: value }));

  useFocusEffect(
    useCallback(() => {
      api<Session>("/api/auth/session")
        .then((d) => {
          setSession(d.user);
          // Prefill the profile form once so edits in progress aren't clobbered.
          if (d.user && !prefilled.current) {
            prefilled.current = true;
            const ftIn = d.user.height_cm ? cmToFtIn(Number(d.user.height_cm)) : null;
            setProfile({
              displayName: d.user.display_name ?? "",
              goal: d.user.goal ?? "",
              gender: d.user.gender ?? "",
              dateOfBirth: d.user.date_of_birth ? d.user.date_of_birth.slice(0, 10) : "",
              heightFt: ftIn ? String(ftIn.feet) : "",
              heightIn: ftIn ? String(ftIn.inches) : "",
            });
          }
        })
        .catch(() => {});
    }, [])
  );

  async function saveProfile() {
    setProfileBusy(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: {
          displayName: profile.displayName.trim() || undefined,
          goal: profile.goal || undefined,
          gender: profile.gender || undefined,
          dateOfBirth: profile.dateOfBirth || undefined,
          heightCm:
            profile.heightFt || profile.heightIn
              ? ftInToCm(Number(profile.heightFt || 0), Number(profile.heightIn || 0))
              : undefined,
        },
      });
      setProfileSaved(true);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setProfileBusy(false);
    }
  }

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

  async function logout() {
    await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => {});
    await setToken(null);
    router.replace("/onboarding");
  }

  const trialActive = session?.trial_ends_at && new Date(session.trial_ends_at) > new Date();
  const dateOfBirthOk =
    !profile.dateOfBirth || /^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Heading>Settings</Heading>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.name}>{session?.display_name ?? "—"}</Text>
          <Text style={styles.meta}>
            {session?.email ?? "Guest — remembered on this device, no account needed"}
          </Text>
          <Text style={styles.meta}>
            Goal: {session?.goal?.replace(/_/g, " ") ?? "not set"} · Streak:{" "}
            {session?.current_streak ?? 0}d (best {session?.longest_streak ?? 0}d)
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>About you</Text>
          <Text style={styles.meta}>
            All optional — the more your coach knows, the better your challenges
            and calorie targets get.
          </Text>
          <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
            <FieldLabel>Name</FieldLabel>
            <Input value={profile.displayName} onChangeText={setField("displayName")} maxLength={60} />

            <FieldLabel>Goal</FieldLabel>
            <Chips options={GOALS} value={profile.goal} onChange={setField("goal")} />

            <FieldLabel>Gender</FieldLabel>
            <Chips options={GENDERS} value={profile.gender} onChange={setField("gender")} />

            <FieldLabel>Birth date (YYYY-MM-DD)</FieldLabel>
            <Input
              placeholder="1985-06-15"
              autoCapitalize="none"
              value={profile.dateOfBirth}
              onChangeText={setField("dateOfBirth")}
            />

            <View style={styles.heightRow}>
              <View style={{ flex: 1 }}>
                <FieldLabel>Height (ft)</FieldLabel>
                <Input
                  keyboardType="numeric"
                  placeholder="5"
                  value={profile.heightFt}
                  onChangeText={setField("heightFt")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel>Height (in)</FieldLabel>
                <Input
                  keyboardType="numeric"
                  placeholder="10"
                  value={profile.heightIn}
                  onChangeText={setField("heightIn")}
                />
              </View>
            </View>

            <ErrorText>{profileError}</ErrorText>
            {profileSaved && <Text style={styles.saved}>Saved.</Text>}
            <Button
              title="Save"
              onPress={saveProfile}
              loading={profileBusy}
              disabled={!dateOfBirthOk}
              style={{ marginTop: spacing.md }}
            />
          </View>
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
  heightRow: { flexDirection: "row", gap: spacing.sm },
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
