/*
  index.tsx

  Simple entry route that redirects the user depending on authentication state.
  - while loading: render an empty view
  - if logged in: go to `/home`
  - otherwise: go to `/onboarding`
*/
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Keep a minimal placeholder while auth state loads
  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  // Redirect based on whether a user session exists
  return <Redirect href={user ? "/home" : "/onboarding"} />;
}
