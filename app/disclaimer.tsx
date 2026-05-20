/*
  disclaimer.tsx

  Presents an important non-medical-disclaimer to users before allowing
  them to continue into the app. Simple static content + navigation button.
*/
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

export default function Disclaimer() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topSpacer} />
          <ThemeToggle />
        </View>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-alert" size={36} color={colors.warning} />
        </View>

        <Text style={styles.title}>Important Information</Text>
        <Text style={styles.subtitle}>Please read before using this application</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardIcon}>
              <Feather name="alert-triangle" size={18} color={colors.warning} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Not a Medical Diagnosis Tool</Text>
              <Text style={styles.cardText}>
                This application does not provide exact or medical diagnoses of allergies.
                The results and insights shown are based on pattern recognition only.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.cardIcon, styles.cardIconPrimary]}>
              <MaterialCommunityIcons name="shield-alert" size={18} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>For Analysis Purposes Only</Text>
              <Text style={styles.cardText}>
                This app is intended to help you recognize and analyze possible food-related
                allergies by tracking what you eat and how you feel. It is a personal tracking tool,
                not a substitute for professional medical advice.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.cardIcon, styles.cardIconSuccess]}>
              <MaterialCommunityIcons name="stethoscope" size={18} color={colors.success} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Always Consult a Doctor</Text>
              <Text style={styles.cardText}>
                For accurate diagnosis and treatment, please always consult a certified doctor or
                medical professional. Your health and safety are our top priority.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/auth")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>I Understand, Continue</Text>
          <Feather name="chevron-right" size={18} color={colors.primaryText} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: {
  background: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  warning: string;
  warningBg: string;
  success: string;
  border: string;
}) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  topSpacer: {
    flex: 1,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.warningBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.warningBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconPrimary: {
    backgroundColor: colors.surface,
  },
  cardIconSuccess: {
    backgroundColor: colors.surface,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  primaryButton: {
    width: "100%",
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "600",
  },
});
