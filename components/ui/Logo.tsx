import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

type LogoProps = {
  size?: "md" | "lg";
};

export function Logo({ size = "md" }: LogoProps) {
  const { colors } = useTheme();
  const styles = getStyles(size, colors);
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>A</Text>
      </View>
      <Text style={styles.wordmark}>Allersense</Text>
    </View>
  );
}

const getStyles = (size: "md" | "lg", colors: { primary: string; text: string; primaryText: string }) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      gap: size === "lg" ? 10 : 8,
    },
    mark: {
      width: size === "lg" ? 64 : 52,
      height: size === "lg" ? 64 : 52,
      borderRadius: size === "lg" ? 20 : 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    markText: {
      color: colors.primaryText,
      fontSize: size === "lg" ? 28 : 22,
      fontWeight: "700",
    },
    wordmark: {
      fontSize: size === "lg" ? 22 : 18,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: 0.5,
    },
  });
