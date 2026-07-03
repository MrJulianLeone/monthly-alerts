import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { api, ApiError, setToken } from "../../lib/api";
import { Button, ErrorText } from "../../components/ui";
import { colors, radius, spacing } from "../../lib/theme";

type Message = {
  id: string;
  sender: "coach" | "user";
  kind: string;
  content: string | null;
  metadata: { challenge_id?: string; balance?: string; items?: string[] };
  created_at: string;
};

const BALANCE_LABELS: Record<string, string> = {
  balanced: "Balanced plate",
  needs_protein: "Add some protein",
  needs_vegetables: "Add some vegetables",
  heavy: "On the heavy side",
  light: "A lighter meal",
  unclear: "Meal logged",
};

type Challenge = {
  id: string;
  name: string;
  target_value: number;
  unit: string;
  sequence_number: number;
};

/** The main screen: chat with the AI Coach. Two actions only. */
export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"meal" | "challenge" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [chat, current] = await Promise.all([
        api<{ messages: Message[] }>("/api/chat?limit=50"),
        api<{ challenge: Challenge | null }>("/api/challenges/current"),
      ]);
      setMessages(chat.messages);
      setChallenge(current.challenge);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await setToken(null);
        router.replace("/onboarding");
        return;
      }
      setError("Could not load your coach. Pull to retry.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    registerPushToken();
  }, [load]);

  async function registerPushToken() {
    try {
      if (!Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
      await api("/api/push/register", {
        body: { token: expoToken, platform: Platform.OS === "ios" ? "ios" : "android" },
      });
    } catch {
      // push is optional; never block the chat
    }
  }

  async function snapMeal() {
    setError("");
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    const picker =
      permission.status === "granted"
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (picker.canceled || !picker.assets?.[0]) return;

    setBusyAction("meal");
    try {
      const asset = picker.assets[0];
      const formData = new FormData();
      formData.append("photo", {
        uri: asset.uri,
        name: "meal.jpg",
        type: "image/jpeg",
      } as unknown as Blob);
      await api("/api/meals", { formData });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not analyze your meal. Try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function didIt() {
    if (!challenge) return;
    setBusyAction("challenge");
    setError("");
    try {
      await api("/api/challenges/complete", { body: { challengeId: challenge.id } });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not record your challenge. Try again.");
    } finally {
      setBusyAction(null);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isCoach = item.sender === "coach";
    if (item.kind === "meal_photo") {
      const balance = item.metadata.balance ?? "unclear";
      const items = item.metadata.items ?? [];
      return (
        <View style={[styles.bubbleRow, styles.rowUser]}>
          <View style={[styles.bubble, styles.bubbleUser]}>
            <Text style={styles.mealTag}>MEAL LOGGED</Text>
            <Text style={styles.bubbleUserText}>{BALANCE_LABELS[balance] ?? "Meal logged"}</Text>
            {items.length > 0 && <Text style={styles.mealItems}>{items.join(", ")}</Text>}
          </View>
        </View>
      );
    }
    if (item.kind === "challenge_complete") {
      return (
        <View style={[styles.bubbleRow, styles.rowUser]}>
          <View style={[styles.bubble, styles.bubbleUser]}>
            <Text style={styles.bubbleUserText}>I did it.</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.bubbleRow, isCoach ? styles.rowCoach : styles.rowUser]}>
        <View style={[styles.bubble, isCoach ? styles.bubbleCoach : styles.bubbleUser]}>
          {item.kind === "monthly_summary" && (
            <Text style={styles.summaryTag}>MONTHLY SUMMARY</Text>
          )}
          <Text style={isCoach ? styles.bubbleCoachText : styles.bubbleUserText}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Coach</Text>
        {challenge && (
          <Text style={styles.headerChallenge}>
            Challenge #{challenge.sequence_number}: {challenge.name} — {challenge.target_value}{" "}
            {challenge.unit === "seconds" ? "sec" : "reps"}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : (
        <FlatList
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={false}
        />
      )}

      <View style={styles.actions}>
        <ErrorText>{error}</ErrorText>
        <View style={styles.actionButtons}>
          <Button
            title="Snap Meal"
            onPress={snapMeal}
            loading={busyAction === "meal"}
            disabled={busyAction !== null}
            style={styles.actionButton}
          />
          <Button
            title="I Did It"
            variant="secondary"
            onPress={didIt}
            loading={busyAction === "challenge"}
            disabled={busyAction !== null || !challenge}
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  header: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
  headerChallenge: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  bubbleRow: { flexDirection: "row", marginVertical: 4 },
  rowCoach: { justifyContent: "flex-start" },
  rowUser: { justifyContent: "flex-end" },
  bubble: { borderRadius: radius.lg, maxWidth: "82%", padding: 14 },
  bubbleCoach: { backgroundColor: colors.coachBubble, borderColor: colors.border, borderWidth: 1 },
  bubbleUser: { backgroundColor: colors.userBubble },
  bubbleCoachText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  bubbleUserText: { color: colors.primaryText, fontSize: 15, lineHeight: 21 },
  summaryTag: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  mealTag: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.7,
  },
  mealItems: { color: colors.primaryText, fontSize: 13, lineHeight: 18, marginTop: 4, opacity: 0.8 },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  actionButtons: { flexDirection: "row", gap: spacing.sm },
  actionButton: { flex: 1 },
});
