/*
  onboarding.tsx

  Simple multi-page onboarding flow that introduces app features.
  The final step navigates to the disclaimer screen.
*/
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

const onboardingPages = [
  {
    icon: "silverware-fork-knife",
    title: "Track What You Eat. Understand Your Reactions.",
    points: [
      "Log your daily food",
      "Track symptoms with time",
      "Discover possible allergy triggers",
    ],
  },
  {
    icon: "brain",
    title: "Smart Ingredient & Symptom Analysis",
    points: [
      "Scan packaged food ingredients",
      "Auto-save food logs",
      "AI finds possible trigger foods",
    ],
  },
  {
    icon: "shield",
    title: "Stay Safe From Hidden Allergens",
    points: [
      "Identify hidden ingredients",
      "Build your allergy pattern report",
      "Share reports with doctors",
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      router.push("/disclaimer");
    }
  };

  const handleSkip = () => {
    router.push("/disclaimer");
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const page = onboardingPages[currentPage];
  const isLastPage = currentPage === onboardingPages.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <ThemeToggle />
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={page.icon as any} size={48} color={colors.primary} />
        </View>

        <Text style={styles.title}>{page.title}</Text>

        <View style={styles.points}>
          {page.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.dot} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.indicators}>
          {onboardingPages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {currentPage > 0 && (
          <TouchableOpacity onPress={handlePrev} style={styles.outlineButton}>
            <Feather name="chevron-left" size={18} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleNext} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            {isLastPage ? "Get Started" : "Next"}
          </Text>
          {!isLastPage && (
            <Feather name="chevron-right" size={18} color={colors.primaryText} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  border: string;
}) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  points: {
    width: "100%",
    gap: 12,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  pointText: {
    fontSize: 13,
    color: colors.muted,
  },
  indicators: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    padding: 20,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  outlineButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "600",
  },
});
