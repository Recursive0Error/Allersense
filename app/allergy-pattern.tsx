/*
  allergy-pattern.tsx

  Detail screen that shows the inferred allergy pattern for a specific
  allergy name. Uses `useData().getAllergyPatternDetails` to fetch
  linked ingredients and symptoms for display.
*/
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AnimatedScreen } from "../components/AnimatedScreen";
import { useData } from "../contexts/DataContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatDisplayDate } from "../utils/date";
import { to12HourTime } from "../utils/time";

export default function AllergyPatternDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { getAllergyPatternDetails } = useData();
  const params = useLocalSearchParams<{ allergy?: string }>();

  const allergyName = useMemo(() => {
    const raw = params.allergy;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.allergy]);

  const details = allergyName ? getAllergyPatternDetails(allergyName) : null;

  return (
    <AnimatedScreen style={styles.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={16} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Allergy Details</Text>
        </View>

        {!details ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>No details found for this allergy pattern.</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.heading}>{details.allergyName}</Text>
              <Text style={styles.meta}>
                Correlation: {details.triggerScore}% | Reactions: {details.reactionCount} | Entries:{" "}
                {details.totalConsumed}
              </Text>
              <Text style={styles.meta}>Symptom-free: {details.symptomFreeCount}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Matched Keywords</Text>
              <Text style={styles.bodyText}>
                {details.matchedKeywords.length > 0 ? details.matchedKeywords.join(", ") : "None"}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Linked Symptoms</Text>
              {details.symptoms.length > 0 ? (
                details.symptoms.map((symptom) => (
                  <View key={symptom.symptomId} style={styles.row}>
                    <Text style={styles.rowTitle}>{symptom.symptomName}</Text>
                    <Text style={styles.rowMeta}>
                      {formatDisplayDate(symptom.date)} at {to12HourTime(symptom.time)} | Severity {symptom.severity}/5
                    </Text>
                    {symptom.notes ? <Text style={styles.rowNote}>{symptom.notes}</Text> : null}
                  </View>
                ))
              ) : (
                <Text style={styles.bodyText}>No matching symptoms in the current logs.</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Associated Entries</Text>
              {details.entries.length > 0 ? (
                details.entries.map((entry) => (
                  <View key={`${entry.ingredientId}-${entry.matchedKeyword}`} style={styles.row}>
                    <Text style={styles.rowTitle}>{entry.ingredientText}</Text>
                    <Text style={styles.rowMeta}>
                      {formatDisplayDate(entry.date)} at {to12HourTime(entry.time)} | Matched: {entry.matchedKeyword}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.bodyText}>No entries linked to this allergy.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

const getStyles = (colors: {
  background: string;
  card: string;
  text: string;
  muted: string;
  border: string;
}) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 16,
      paddingBottom: 28,
      gap: 12,
    },
    header: {
      marginBottom: 6,
      gap: 10,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.card,
    },
    backText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      gap: 8,
    },
    heading: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    meta: {
      fontSize: 12,
      color: colors.muted,
    },
    bodyText: {
      fontSize: 12,
      color: colors.text,
    },
    row: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      gap: 2,
    },
    rowTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    rowMeta: {
      fontSize: 11,
      color: colors.muted,
    },
    rowNote: {
      fontSize: 11,
      color: colors.text,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 12,
    },
  });
