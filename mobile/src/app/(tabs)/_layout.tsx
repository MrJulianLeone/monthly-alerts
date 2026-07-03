import { ComponentProps } from "react";
import { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** Filled icon when active, outline when inactive — matches iOS/messaging apps. */
function tabIcon(active: IoniconName, inactive: IoniconName) {
  return function Icon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={24} color={color} />;
  };
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom || 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 52 + bottom,
          paddingBottom: bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Coach",
          tabBarIcon: tabIcon("chatbubble-ellipses", "chatbubble-ellipses-outline"),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: tabIcon("trophy", "trophy-outline"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: tabIcon("time", "time-outline"),
        }}
      />
      <Tabs.Screen
        name="refer"
        options={{
          title: "Refer",
          tabBarIcon: tabIcon("person-add", "person-add-outline"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: tabIcon("settings", "settings-outline"),
        }}
      />
    </Tabs>
  );
}
