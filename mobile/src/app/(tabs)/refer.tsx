import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { api, ApiError } from "../../lib/api";
import { Button, ErrorText, FieldLabel, Heading, Input, Subtext } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

type Board = { id: string; name: string };
type Referral = {
  id: string;
  invitee_email: string;
  status: string;
  leaderboard_name: string;
};

export default function ReferScreen() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [email, setEmail] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [boardData, referralData] = await Promise.all([
        api<{ leaderboards: Board[] }>("/api/leaderboards"),
        api<{ referrals: Referral[] }>("/api/referrals"),
      ]);
      setBoards(boardData.leaderboards);
      setSelectedBoard((prev) => prev ?? boardData.leaderboards[0] ?? null);
      setReferrals(referralData.referrals);
    } catch {
      // shown as empty state
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function invite() {
    if (!selectedBoard) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/api/referrals", {
        body: { email: email.trim(), leaderboardId: selectedBoard.id },
      });
      setNotice(`Invitation sent to ${email.trim()}.`);
      setEmail("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send the invite");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Heading>Refer friends</Heading>
        <Subtext>
          Friends join by invitation only. They get an email, accept, and appear on your
          leaderboard. Goal: 5 friends.
        </Subtext>

        {boards.length === 0 ? (
          <Subtext>Create a leaderboard first (Leaderboard tab), then invite friends.</Subtext>
        ) : (
          <View style={styles.form}>
            <FieldLabel>Leaderboard</FieldLabel>
            <View style={styles.tabs}>
              {boards.map((board) => (
                <Text
                  key={board.id}
                  onPress={() => setSelectedBoard(board)}
                  style={[styles.tab, selectedBoard?.id === board.id && styles.tabActive]}
                >
                  {board.name}
                </Text>
              ))}
            </View>
            <FieldLabel>Friend&apos;s email</FieldLabel>
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="friend@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <ErrorText>{error}</ErrorText>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <Button
              title="Send invitation"
              onPress={invite}
              loading={busy}
              disabled={!email.includes("@") || !selectedBoard}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        <FlatList
          data={referrals}
          keyExtractor={(r) => r.id}
          style={{ marginTop: spacing.lg }}
          ListHeaderComponent={
            referrals.length > 0 ? <Text style={styles.sent}>Sent invitations</Text> : null
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowEmail}>{item.invitee_email}</Text>
                <Text style={styles.rowMeta}>{item.leaderboard_name}</Text>
              </View>
              <Text style={[styles.status, item.status === "accepted" && styles.statusAccepted]}>
                {item.status}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, padding: spacing.lg },
  form: { marginTop: spacing.lg },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  tab: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    color: colors.textSecondary,
    fontSize: 13,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.primaryText },
  notice: { color: colors.success, fontSize: 14, marginTop: spacing.sm },
  sent: { color: colors.textMuted, fontSize: 13, fontWeight: "600", marginBottom: spacing.sm },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  rowEmail: { color: colors.text, fontSize: 14, fontWeight: "500" },
  rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  status: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  statusAccepted: { color: colors.success },
});
