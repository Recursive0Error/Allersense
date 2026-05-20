/*
  home.tsx

  Main dashboard displayed after login. Shows quick stats, actions
  (add ingredients, symptoms, scan) and lists inferred allergy patterns.
*/
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AnimatedScreen } from "../../components/AnimatedScreen";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { formatDisplayDate } from "../../utils/date";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const {
    getTodayStats,
    patterns,
    safeFoods,
    getEliminationStats,
    confirmPattern,
    dismissPattern,
    markFoodSafe,
  } = useData();

  const today = new Date();
  const stats = getTodayStats();
  const eliminationStats = getEliminationStats();
  const isEliminationMode = (user as any)?.eliminationMode;
  const knownAllergens = (user as any)?.knownAllergens || [];

  const visiblePatterns = patterns.filter((p) => p.status !== "dismissed");

  const photoUrl = (user as any)?.photoUrl as string | undefined;

  return (
    <AnimatedScreen style={styles.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
          <Text style={styles.dateText}>{formatDisplayDate(today)}</Text>
          <Text style={styles.title}>
            Hello, {user?.name?.split(" ")[0] || "there"}! 👋
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeToggle />
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
          >
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <Feather name="user" size={20} color={colors.muted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, styles.primaryTint]}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={18}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={styles.cardValue}>{stats.foodsLogged}</Text>
              <Text style={styles.cardLabel}>Foods logged today</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, styles.accentTint]}>
              <Feather name="activity" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.cardValue}>{stats.symptomsLogged}</Text>
              <Text style={styles.cardLabel}>Symptoms logged</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          onPress={() => router.push("/ingredients")}
          style={[styles.actionButton, styles.primaryButton]}
        >
          <Feather name="plus" size={18} color={colors.primaryText} />
          <Text style={styles.actionTextLight}>Ingredients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/symptoms")}
          style={[styles.actionButton, styles.outlineAccent]}
        >
          <Feather name="activity" size={18} color={colors.accent} />
          <Text style={styles.actionTextAccent}>Symptoms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/scanner")}
          style={[styles.actionButton, styles.outlinePrimary]}
        >
          <Feather name="camera" size={18} color={colors.primary} />
          <Text style={styles.actionTextPrimary}>Scan Food</Text>
        </TouchableOpacity>
      </View>

      {isEliminationMode && knownAllergens.length > 0 && (
        <View style={styles.cardSoft}>
          <View style={styles.cardHeaderRow}>
            <Feather name="check-circle" size={16} color={colors.primary} />
            <Text style={styles.cardTitle}>Elimination Mode Active</Text>
          </View>
          <Text style={styles.mutedText}>
            Tracking: {knownAllergens.join(", ")}
          </Text>
          <View style={styles.eliminationRow}>
            <View style={styles.eliminationBlock}>
              <Text style={styles.emphasis}>{eliminationStats.symptomFreeDays}</Text>
              <Text style={styles.cardLabel}>Symptom-free days</Text>
            </View>
            {eliminationStats.lastSymptomDate && (
              <View style={styles.eliminationBlock}>
                <Text style={styles.smallMuted}>
                  Last symptom:{" "}
                  {formatDisplayDate(new Date(eliminationStats.lastSymptomDate))}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Detected Allergy Patterns</Text>
        </View>

        {visiblePatterns.length > 0 ? (
          <View style={styles.patternList}>
            {visiblePatterns.map((pattern) => (
              <TouchableOpacity
                key={pattern.food}
                style={styles.patternCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/allergy-pattern",
                    params: { allergy: pattern.food },
                  })
                }
              >
                <View style={styles.patternHeader}>
                  <View style={styles.patternLeft}>
                    <View style={styles.patternIcon}>
                      <Feather name="alert-triangle" size={14} color={colors.warning} />
                    </View>
                    <View>
                      <Text style={styles.patternTitle}>{pattern.food}</Text>
                      <Text style={styles.patternMeta}>
                        {pattern.reactionCount} reaction
                        {pattern.reactionCount !== 1 ? "s" : ""} /{" "}
                        {pattern.totalConsumed} matching entries
                      </Text>
                    </View>
                  </View>
                  <View style={styles.patternScore}>
                    <Text style={styles.patternScoreValue}>
                      {pattern.triggerScore}%
                    </Text>
                    <Text style={styles.patternMeta}>correlation</Text>
                  </View>
                </View>

                {pattern.linkedSymptoms.length > 0 && (
                  <Text style={styles.patternMeta}>
                    Linked symptoms: {pattern.linkedSymptoms.join(", ")}
                  </Text>
                )}
                {pattern.basedOnEntries && pattern.basedOnEntries.length > 0 && (
                  <Text style={styles.patternMeta}>
                    Based on entries: {pattern.basedOnEntries.slice(0, 2).join(" | ")}
                  </Text>
                )}
                {pattern.matchedKeywords && pattern.matchedKeywords.length > 0 && (
                  <Text style={styles.patternMeta}>
                    Matched keywords: {pattern.matchedKeywords.slice(0, 3).join(", ")}
                  </Text>
                )}
                <Text style={styles.patternNote}>{pattern.advisoryMessage}</Text>
                <Text style={styles.patternMeta}>Tap to view full linked details</Text>

                {pattern.status === "suspected" && (
                  <View style={styles.patternActions}>
                    <TouchableOpacity
                      style={styles.chipButton}
                      onPress={() => confirmPattern(pattern.food)}
                    >
                      <Feather name="thumbs-up" size={12} color={colors.text} />
                      <Text style={styles.chipText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chipButton}
                      onPress={() => dismissPattern(pattern.food)}
                    >
                      <Feather name="x-circle" size={12} color={colors.text} />
                      <Text style={styles.chipText}>Dismiss</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chipButton}
                      onPress={() => markFoodSafe(pattern.food)}
                    >
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={12}
                        color={colors.text}
                      />
                      <Text style={styles.chipText}>Mark Safe</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {pattern.status === "confirmed" && (
                  <View style={styles.confirmedRow}>
                    <Feather name="check-circle" size={12} color={colors.accent} />
                    <Text style={styles.confirmedText}>Confirmed by you</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="trending-up" size={20} color={colors.muted} />
            </View>
            <Text style={styles.emptyText}>
              No patterns detected yet. Keep logging your foods and symptoms to
              build a clearer picture.
            </Text>
          </View>
        )}

      </View>

      {/* Lower-Risk Allergies (hidden on home screen)
      {safeFoods.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Lower-Risk Allergies</Text>
          </View>
          <View style={styles.safeFoods}>
            {safeFoods.map((food) => (
              <View key={food.food} style={styles.safeChip}>
                <Feather name="check-circle" size={12} color={colors.primary} />
                <Text style={styles.safeChipText}>{food.food}</Text>
                <Text style={styles.safeChipMeta}>
                  ({food.totalConsumed}x)
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      */}
      </ScrollView>
    </AnimatedScreen>
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
  accent: string;
  warning: string;
  warningBg: string;
  border: string;
  success: string;
}) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    marginBottom: 16,
  },
  cardSoft: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTint: {
    backgroundColor: colors.surface,
  },
  accentTint: {
    backgroundColor: colors.surface,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineAccent: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  outlinePrimary: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  actionTextLight: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "600",
  },
  actionTextAccent: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  actionTextPrimary: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  mutedText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 12,
  },
  eliminationRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  eliminationBlock: {
    alignItems: "center",
  },
  emphasis: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  smallMuted: {
    fontSize: 12,
    color: colors.muted,
  },
  patternList: {
    gap: 12,
  },
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  patternHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  patternLeft: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  patternIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.warningBg,
    alignItems: "center",
    justifyContent: "center",
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  patternMeta: {
    fontSize: 11,
    color: colors.muted,
  },
  patternScore: {
    alignItems: "flex-end",
  },
  patternScoreValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.warning,
  },
  patternNote: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 6,
    marginBottom: 8,
  },
  patternActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  chipText: {
    fontSize: 11,
    color: colors.text,
  },
  confirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  confirmedText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  safeFoods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  safeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  safeChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  safeChipMeta: {
    fontSize: 10,
    color: colors.muted,
  },
});
