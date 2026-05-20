import { Tabs, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneContainerStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 2 : size;
          switch (route.name) {
            case "home":
              return <Feather name="home" size={iconSize} color={color} />;
            case "ingredients":
              return <Feather name="list" size={iconSize} color={color} />;
            case "symptoms":
              return <Feather name="activity" size={iconSize} color={color} />;
            case "scanner":
              return <Feather name="camera" size={iconSize} color={color} />;
            case "profile":
              return <Feather name="user" size={iconSize} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="ingredients" options={{ title: "Ingredients" }} />
      <Tabs.Screen name="symptoms" options={{ title: "Symptoms" }} />
      <Tabs.Screen name="scanner" options={{ title: "Scanner" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
