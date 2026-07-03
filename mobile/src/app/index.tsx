import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { getToken } from "../lib/api";
import { colors } from "../lib/theme";

/** Entry point: signed-in users land in the chat, everyone else onboards. */
export default function Index() {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    getToken().then((token) => setState(token ? "in" : "out"));
  }, []);

  if (state === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }
  return <Redirect href={state === "in" ? "/(tabs)" : "/onboarding"} />;
}
