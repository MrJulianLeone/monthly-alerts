import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { Button, Card, ErrorText, Heading, Subtext } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

type Board = { id: string; name: string; member_count: number };
type Standing = {
  rank: number;
  displayName: string;
  streak: number;
  challengesThisWeek: number;
  mealsThisWeek: number;
  score: number;
  isYou: boolean;
};

const GOAL = 5;

export default function LeaderboardScreen() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selected, setSelected] = useState<Board | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<{ leaderboards: Board[] }>("/api/leaderboards");
      setBoards(data.leaderboards);
      const first = data.leaderboards[0] ?? null;
      setSelected(first);
      if (first) {
        const detail = await api<{ standings: Standing[] }>(`/api/leaderboards/${first.id}`);
        setStandings(detail.standings);
      }
    } catch {
      setError("Could not load leaderboards.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function selectBoard(board: Board) {
    setSelected(board);
    setStandings([]);
    const detail = await api<{ standings: Standing[] }>(`/api/leaderboards/${board.id}`);
    setStandings(detail.standings);
  }

  async function createBoard() {
    setBusy(true);
    setError("");
    try {
      await api("/api/leaderboards", { body: { name: "My Leaderboard" } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create leaderboard");
    } finally {
      setBusy(false);
    }
  }

  async function leaveBoard() {
    if (!selected) return;
    setBusy(true);
    try {
      await api(`/api/leaderboards/${selected.id}/leave`, { method: "POST", body: {} });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Heading>Leaderboard</Heading>

        {boards.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={styles.emptyTitle}>Invite-only, friends first</Text>
            <Subtext>
              Create a leaderboard, then refer friends from the Refer tab. Build it to{" "}
              {GOAL} friends. You can join up to 3.
            </Subtext>
            <Button
              title="Create my leaderboard"
              onPress={createBoard}
              loading={busy}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <>
            <View style={styles.tabs}>
              {boards.map((board) => (
                <Text
                  key={board.id}
                  onPress={() => selectBoard(board)}
                  style={[styles.tab, selected?.id === board.id && styles.tabActive]}
                >
                  {board.name}
                </Text>
              ))}
            </View>

            {selected && selected.member_count < GOAL && (
              <Text style={styles.goalText}>
                {selected.member_count}/{GOAL} friends — invite {GOAL - selected.member_count}{" "}
                more from the Refer tab.
              </Text>
            )}

            <FlatList
              data={standings}
              keyExtractor={(s) => String(s.rank)}
              style={{ marginTop: spacing.md }}
              ListEmptyComponent={
                <Subtext>No active friends in the last 14 days yet.</Subtext>
              }
              renderItem={({ item }) => (
                <View style={[styles.row, item.isYou && styles.rowYou]}>
                  <Text style={styles.rank}>{item.rank}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {item.displayName}
                      {item.isYou ? " (you)" : ""}
                    </Text>
                    <Text style={styles.meta}>
                      {item.challengesThisWeek} challenges · {item.mealsThisWeek} meals ·{" "}
                      {item.streak}d streak
                    </Text>
                  </View>
                  <Text style={styles.score}>{item.score}</Text>
                </View>
              )}
            />

            <Button
              title="Leave this leaderboard"
              variant="secondary"
              onPress={leaveBoard}
              loading={busy}
              style={{ marginBottom: spacing.sm }}
            />
          </>
        )}
        <ErrorText>{error}</ErrorText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
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
  goalText: { color: colors.accent, fontSize: 13, fontWeight: "600", marginTop: spacing.md },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  rowYou: { borderColor: colors.text },
  rank: { color: colors.textMuted, fontSize: 16, fontWeight: "700", width: 22 },
  name: { color: colors.text, fontSize: 15, fontWeight: "600" },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  score: { color: colors.text, fontSize: 17, fontWeight: "700" },
});
