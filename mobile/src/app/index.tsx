import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { api, getToken } from "../lib/api";
import { colors } from "../lib/theme";

type Destination = "/(tabs)" | "/onboarding" | "/onboarding/enroll";

/**
 * Entry point: signed-in coached users land in the chat; signed-in accounts
 * without a coaching profile (e.g. parents) are offered self-enrollment;
 * everyone else onboards.
 */
export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return setDestination("/onboarding");
      try {
        const session = await api<{ user: { display_name: string | null } | null }>(
          "/api/auth/session"
        );
        setDestination(session.user?.display_name ? "/(tabs)" : "/onboarding/enroll");
      } catch {
        setDestination("/(tabs)"); // offline: let the chat screen handle auth
      }
    })();
  }, []);

  if (!destination) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }
  return <Redirect href={destination} />;
}
