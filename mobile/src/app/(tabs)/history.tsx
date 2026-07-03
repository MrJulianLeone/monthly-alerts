import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { Heading, Subtext } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

type Meal = {
  id: string;
  ai_feedback: string | null;
  ai_analysis: { balance?: string; items?: string[] } | null;
  logged_at: string;
};

const BALANCE_LABELS: Record<string, string> = {
  balanced: "Balanced plate",
  needs_protein: "Add some protein",
  needs_vegetables: "Add some vegetables",
  heavy: "On the heavy side",
  light: "A lighter meal",
  unclear: "Meal logged",
};
type Completed = {
  id: string;
  sequence_number: number;
  name: string;
  unit: string;
  target_value: number;
  completed_value: number | null;
  completed_at: string;
};
type Summary = { id: string; month: string; narrative: string | null };

type Tab = "meals" | "challenges" | "summaries";

export default function HistoryScreen() {
  const [tab, setTab] = useState<Tab>("summaries");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [challenges, setChallenges] = useState<Completed[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useFocusEffect(
    useCallback(() => {
      api<{ meals: Meal[] }>("/api/meals?limit=50").then((d) => setMeals(d.meals)).catch(() => {});
      api<{ history: Completed[] }>("/api/challenges/history?limit=50")
        .then((d) => setChallenges(d.history))
        .catch(() => {});
      api<{ summaries: Summary[] }>("/api/summaries")
        .then((d) => setSummaries(d.summaries))
        .catch(() => {});
    }, [])
  );

  const monthLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Heading>History</Heading>
        <View style={styles.tabs}>
          {(
            [
              ["summaries", "Monthly summaries"],
              ["meals", "Meals"],
              ["challenges", "Challenges"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <Text
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, tab === key && styles.tabActive]}
            >
              {label}
            </Text>
          ))}
        </View>

        {tab === "summaries" && (
          <FlatList
            data={summaries}
            keyExtractor={(s) => s.id}
            ListEmptyComponent={
              <Subtext>
                Your first monthly progress summary arrives at the end of the month. It&apos;s the
                heart of MonthlyAlerts — keep logging.
              </Subtext>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{monthLabel(item.month)}</Text>
                <Text style={styles.cardBody}>{item.narrative}</Text>
              </View>
            )}
          />
        )}

        {tab === "meals" && (
          <FlatList
            data={meals}
            keyExtractor={(m) => m.id}
            ListEmptyComponent={<Subtext>No meals logged yet. Snap your first meal.</Subtext>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {BALANCE_LABELS[item.ai_analysis?.balance ?? "unclear"] ?? "Meal logged"}
                </Text>
                <Text style={styles.cardMeta}>{new Date(item.logged_at).toLocaleString()}</Text>
                <Text style={styles.cardBodySmall} numberOfLines={3}>
                  {item.ai_feedback}
                </Text>
              </View>
            )}
          />
        )}

        {tab === "challenges" && (
          <FlatList
            data={challenges}
            keyExtractor={(c) => c.id}
            ListEmptyComponent={<Subtext>No challenges completed yet.</Subtext>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  #{item.sequence_number} {item.name}
                </Text>
                <Text style={styles.cardMeta}>
                  Target {item.target_value} {item.unit === "seconds" ? "sec" : "reps"}
                  {item.completed_value ? ` · did ${item.completed_value}` : ""} ·{" "}
                  {new Date(item.completed_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, padding: spacing.lg },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.md },
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  cardBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  cardBodySmall: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  cardMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
