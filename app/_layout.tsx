/*
  _layout.tsx

  Root app layout that wires together providers used by the app:
  - `QueryClientProvider` for react-query
  - `SafeAreaProvider` for safe area handling on devices
  - `ThemeProvider`, `AuthProvider`, `DataProvider` for global app state

  It also renders the navigation `Stack` with theme-aware styling.
*/
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { DataProvider } from "../contexts/DataContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <ThemedStack />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function ThemedStack() {
  const { theme, colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaView>
  );
}
