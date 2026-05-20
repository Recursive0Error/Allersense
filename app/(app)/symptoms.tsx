/*
  symptoms.tsx

  Screen for logging symptoms, choosing severity and optionally linking
  the symptom to recent foods. Provides a symptom picker populated from
  the static allergy database for convenience.
*/
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AnimatedScreen } from "../../components/AnimatedScreen";
import { WeekCalendar } from "../../components/calendar/WeekCalendar";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../hooks/use-toast";
import { ALLERGY_DATABASE } from "../../utils/allergyDatabase";
import { formatDisplayDate } from "../../utils/date";
import { to12HourTime, to24HourTime } from "../../utils/time";

const toStableLocalDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const SYMPTOM_OPTIONS = (() => {
  const byKey = new Map<string, string>();
  ALLERGY_DATABASE.forEach((entry) => {
    entry.common_symptoms.forEach((symptom) => {
      const cleaned = symptom.trim();
      if (!cleaned) return;
      const key = cleaned.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, cleaned);
    });
  });

  return [...byKey.values()].sort((a, b) => a.localeCompare(b)).concat("Other");
})();

const severityLabels = ["Minimal", "Mild", "Moderate", "Severe", "Extreme"];

const getSeverityColor = (severity: number, colors: { success: string; warning: string; danger: string }) => {
  if (severity <= 2) return colors.success;
  if (severity <= 3) return colors.warning;
  return colors.danger;
};

const symptomHelp: Record<string, string> = {
  "Breathing difficulty": "Shortness of breath or tight breathing.",
  Bloating: "Feeling of fullness, pressure, or gas in stomach.",
  Diarrhea: "Loose or frequent bowel movements.",
  Fatigue: "Unusual tiredness or low energy.",
  Gas: "Excess stomach gas or burping discomfort.",
  Headache: "Pain or pressure in the head.",
  Heartburn: "Burning feeling in chest/throat after food.",
  Hives: "Raised itchy red skin welts.",
  Itching: "Irritated skin or mouth itch sensation.",
  Nausea: "Feeling like vomiting.",
  Rash: "Visible skin irritation or redness.",
  Redness: "Skin becoming red or inflamed.",
  Sneezing: "Repeated sneezing spells.",
  Swelling: "Puffy lips, face, throat, or skin.",
  "Throat swelling": "Tight/swollen throat sensation.",
  Vomiting: "Throwing up after eating.",
  "Stomach pain": "Cramps or pain in the abdomen.",
  "Mouth irritation": "Burning/itching sensation in mouth.",
  "Mouth itching": "Itchy lips, tongue, or mouth.",
  "Skin rash": "Patchy itchy or red skin areas.",
  "Skin irritation": "General irritated skin discomfort.",
  "Burning sensation": "Burning feeling in mouth/stomach/chest.",
  "Nasal congestion": "Blocked or stuffy nose.",
  "Lip swelling": "Swollen lips after food.",
  "Shortness of breath": "Difficulty taking full breaths.",
  "Other": "Use this if your symptom is not listed.",
};

export default function Symptoms() {
  const {
    getSymptomsForDate,
    addSymptom,
    deleteSymptom,
    symptoms,
    getRecentFoods,
  } = useData();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [selectedDate, setSelectedDate] = useState(() => toStableLocalDate(new Date()));
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSymptomPickerOpen, setIsSymptomPickerOpen] = useState(false);
  const [recentFoods, setRecentFoods] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState({
    symptomName: "",
    customSymptom: "",
    severity: 3,
    time: format(new Date(), "hh:mm a"),
    notes: "",
    suspectedFood: "",
  });

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const dailySymptoms = getSymptomsForDate(dateKey);

  const hasDataForDate = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return symptoms.some((s) => s.date === key);
  };

  useEffect(() => {
    if (isAddingNew) {
      const foods = getRecentFoods(8);
      const uniqueFoods = [...new Set(foods.map((f) => f.foodName))];
      setRecentFoods(uniqueFoods);
    }
  }, [isAddingNew, getRecentFoods]);

  const handleAddEntry = () => {
    const symptomName =
      newEntry.symptomName === "Other"
        ? newEntry.customSymptom
        : newEntry.symptomName;

    if (!symptomName.trim()) {
      toast({
        title: "Error",
        description: "Please select or enter a symptom",
        variant: "destructive",
      });
      return;
    }

    const recentFoodsList = getRecentFoods(8);
    const linkedIngredients = recentFoodsList.map((f) => f.foodName);

    addSymptom({
      symptomName: symptomName.trim(),
      severity: newEntry.severity,
      time: to24HourTime(newEntry.time),
      notes: newEntry.notes,
      date: dateKey,
      suspectedFood: newEntry.suspectedFood || undefined,
      linkedIngredients: linkedIngredients.length > 0 ? linkedIngredients : undefined,
    });

    if (linkedIngredients.length > 0) {
      toast({
        title: "Symptom Logged",
        description: `Linked to ${linkedIngredients.length} foods eaten in the last 8 hours.`,
      });
    } else {
      toast({ title: "Added", description: "Symptom logged successfully" });
    }

    setNewEntry({
      symptomName: "",
      customSymptom: "",
      severity: 3,
      time: format(new Date(), "hh:mm a"),
      notes: "",
      suspectedFood: "",
    });
    setIsAddingNew(false);
  };

  const handleDeleteEntry = (id: string) => {
    deleteSymptom(id);
    toast({ title: "Deleted", description: "Entry removed" });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(toStableLocalDate(date));
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AnimatedScreen style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>Symptoms</Text>

      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        hasData={hasDataForDate}
      />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {dailySymptoms.length}{" "}
            {dailySymptoms.length === 1 ? "symptom" : "symptoms"} logged
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddingNew(true)}
          style={[styles.addButton, isAddingNew && styles.addButtonDisabled]}
          disabled={isAddingNew}
        >
          <Feather name="plus" size={16} color={colors.primaryText} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isAddingNew && (
        <View style={styles.formCard}>
          <View style={styles.formBlock}>
            <Text style={styles.label}>Symptom</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setIsSymptomPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Select symptom"
              accessibilityHint="Opens symptom list"
            >
              <Text
                style={[
                  styles.selectInputText,
                  !newEntry.symptomName && styles.selectInputPlaceholder,
                ]}
              >
                {newEntry.symptomName || "Choose a symptom"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.muted} />
            </TouchableOpacity>

            {newEntry.symptomName === "Other" && (
              <TextInput
                style={styles.input}
                placeholder="Describe your symptom"
                placeholderTextColor={colors.muted}
                value={newEntry.customSymptom}
                onChangeText={(text) =>
                  setNewEntry((prev) => ({ ...prev, customSymptom: text }))
                }
              />
            )}
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>
              Severity: {severityLabels[newEntry.severity - 1]} ({newEntry.severity}
              /5)
            </Text>
            <View style={styles.severityRow}>
              {severityLabels.map((_, index) => {
                const value = index + 1;
                const active = value === newEntry.severity;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() =>
                      setNewEntry((prev) => ({ ...prev, severity: value }))
                    }
                    style={[
                      styles.severityDot,
                      active && {
                        backgroundColor: getSeverityColor(value, colors),
                        borderColor: getSeverityColor(value, colors),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        active && styles.severityTextActive,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={newEntry.time}
              onChangeText={(text) =>
                setNewEntry((prev) => ({ ...prev, time: text }))
              }
              placeholder="hh:mm AM/PM"
              placeholderTextColor={colors.muted}
            />
          </View>

          {recentFoods.length > 0 && (
            <View style={styles.formBlock}>
              <Text style={styles.label}>Suspected Food (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionRow}>
                  {recentFoods.map((food) => (
                    <TouchableOpacity
                      key={food}
                      onPress={() =>
                        setNewEntry((prev) => ({ ...prev, suspectedFood: food }))
                      }
                      style={[
                        styles.optionChip,
                        newEntry.suspectedFood === food &&
                          styles.optionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newEntry.suspectedFood === food &&
                            styles.optionTextActive,
                        ]}
                      >
                        {food}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {recentFoods.length > 0 && (
            <View style={styles.notice}>
              <Feather name="link-2" size={14} color={colors.primary} />
              <Text style={styles.noticeText}>
                This symptom will be linked to {recentFoods.length} foods eaten
                in the last 8 hours.
              </Text>
            </View>
          )}

          <View style={styles.formBlock}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Any additional details..."
              placeholderTextColor={colors.muted}
              value={newEntry.notes}
              onChangeText={(text) =>
                setNewEntry((prev) => ({ ...prev, notes: text }))
              }
              multiline
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsAddingNew(false);
                setNewEntry({
                  symptomName: "",
                  customSymptom: "",
                  severity: 3,
                  time: format(new Date(), "hh:mm a"),
                  notes: "",
                  suspectedFood: "",
                });
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddEntry}>
              <Feather name="check" size={16} color={colors.primaryText} />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={isSymptomPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSymptomPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Symptom</Text>
              <TouchableOpacity
                onPress={() => setIsSymptomPickerOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close symptom picker"
              >
                <Feather name="x" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {SYMPTOM_OPTIONS.map((option) => {
                const selected = newEntry.symptomName === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalItem, selected && styles.modalItemSelected]}
                    onPress={() => {
                      setNewEntry((prev) => ({
                        ...prev,
                        symptomName: option,
                        customSymptom: option === "Other" ? prev.customSymptom : "",
                      }));
                      setIsSymptomPickerOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && styles.modalItemTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                    <View style={styles.modalItemRight}>
                      <Text
                        style={[
                          styles.modalItemHint,
                          selected && styles.modalItemHintSelected,
                        ]}
                      >
                        {symptomHelp[option] || "Select if this best matches what you felt."}
                      </Text>
                      {selected && (
                        <Feather name="check" size={14} color={colors.primaryText} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.list}>
        {dailySymptoms.map((entry) => {
          const severityColor = getSeverityColor(entry.severity, colors);
          return (
            <View key={entry.id} style={styles.listCard}>
              <View style={styles.listHeader}>
                <View style={styles.listLeft}>
                  <View
                    style={[
                      styles.severityIcon,
                      { backgroundColor: `${severityColor}22` },
                    ]}
                  >
                    <Feather name="alert-circle" size={18} color={severityColor} />
                  </View>
                  <View>
                    <Text style={styles.listTitle}>{entry.symptomName}</Text>
                    <View style={styles.listMetaRow}>
                      <View style={styles.timeRow}>
                      <Feather name="clock" size={12} color={colors.muted} />
                        <Text style={styles.timeText}>{to12HourTime(entry.time)}</Text>
                      </View>
                      <View
                        style={[
                          styles.severityChip,
                          { backgroundColor: `${severityColor}22` },
                        ]}
                      >
                        <Text style={[styles.severityChipText, { color: severityColor }]}>
                          {severityLabels[entry.severity - 1]}
                        </Text>
                      </View>
                    </View>
                    {entry.notes ? (
                      <Text style={styles.notesText}>{entry.notes}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteEntry(entry.id)}
                  style={styles.deleteButton}
                >
                    <Feather name="trash-2" size={16} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {dailySymptoms.length === 0 && !isAddingNew && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="alert-circle" size={22} color={colors.muted} />
            </View>
            <Text style={styles.emptyText}>No symptoms logged for this day</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setIsAddingNew(true)}
            >
              <Text style={styles.emptyButtonText}>Log a symptom</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </ScrollView>
      </AnimatedScreen>
    </KeyboardAvoidingView>
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
  border: string;
  warning: string;
  danger: string;
  dangerBg: string;
  accent: string;
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  formBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  optionChipActive: {
    backgroundColor: colors.accent,
  },
  optionText: {
    fontSize: 11,
    color: colors.muted,
  },
  optionTextActive: {
    color: colors.primaryText,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textarea: {
    minHeight: 64,
    textAlignVertical: "top",
  },
  severityRow: {
    flexDirection: "row",
    gap: 8,
  },
  severityDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  severityText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "600",
  },
  severityTextActive: {
    color: colors.primaryText,
  },
  notice: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.muted,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectInputText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  selectInputPlaceholder: {
    color: colors.muted,
    fontWeight: "400",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  cancelText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.accent,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  saveText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  severityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  listMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.muted,
  },
  severityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  severityChipText: {
    fontSize: 10,
    fontWeight: "600",
  },
  notesText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  emptyButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  emptyButtonText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "70%",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  modalList: {
    flexGrow: 0,
  },
  modalItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  modalItemSelected: {
    backgroundColor: colors.accent,
  },
  modalItemText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
  modalItemTextSelected: {
    color: colors.primaryText,
    fontWeight: "600",
  },
  modalItemRight: {
    marginTop: 4,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modalItemHint: {
    flex: 1,
    fontSize: 11,
    color: colors.muted,
  },
  modalItemHintSelected: {
    color: colors.primaryText,
    opacity: 0.9,
  },
});
