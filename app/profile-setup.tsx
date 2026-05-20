/*
  profile-setup.tsx

  Multi-step profile setup used right after sign-up or when creating
  a temporary/demo profile. Lets the user enter name/age and select
  known allergens (or opt into discovery mode).
*/
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";

const COMMON_ALLERGENS = [
  { id: "dairy", label: "Milk / Dairy", emoji: "🥛" },
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "tree-nuts", label: "Tree Nuts", emoji: "🌰" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "wheat", label: "Wheat / Gluten", emoji: "🌾" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "sesame", label: "Sesame", emoji: "🫘" },
];

type Step = "info" | "allergy-question" | "allergy-select";

export default function ProfileSetup() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState("");
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim().toLowerCase();
    if (trimmed && !customAllergens.includes(trimmed)) {
      setCustomAllergens((prev) => [...prev, trimmed]);
      setCustomAllergen("");
    }
  };

  const handleInfoNext = () => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    updateProfile({
      name: name.trim(),
      age: age ? parseInt(age, 10) : undefined,
    });
    setStep("allergy-question");
  };

  const handleNoAllergy = () => {
    updateProfile({ knownAllergens: [], eliminationMode: false });
    toast({
      title: "Profile complete!",
      description: "Let's start tracking your food and symptoms.",
    });
    router.replace("/home");
  };

  const handleSaveAllergens = () => {
    const all = [...selectedAllergens, ...customAllergens];
    if (all.length === 0) {
      toast({
        title: "Please select at least one allergen",
        variant: "destructive",
      });
      return;
    }
    updateProfile({ knownAllergens: all, eliminationMode: true });
    toast({
      title: "Allergies saved!",
      description: "We'll alert you when these are detected.",
    });
    router.replace("/home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.topBar}>
        <View style={styles.topSpacer} />
        <ThemeToggle />
      </View>

      {step === "info" && (
        <View style={styles.panel}>
          <View style={styles.iconWrap}>
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.formBlock}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Your age"
              placeholderTextColor={colors.muted}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity onPress={handleInfoNext} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <Feather name="chevron-right" size={18} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      )}

      {step === "allergy-question" && (
        <View style={styles.panel}>
          <View style={styles.iconWrap}>
            <Text style={styles.emoji}>🤔</Text>
          </View>
          <Text style={styles.title}>Do You Have Any Known Allergies?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>

          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => setStep("allergy-select")}
          >
            <View style={styles.choiceIcon}>
              <Feather name="check" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.choiceTitle}>Yes, I Know My Allergies</Text>
              <Text style={styles.choiceText}>Let me select them</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceCard} onPress={handleNoAllergy}>
            <View style={styles.choiceIcon}>
              <Text style={styles.emojiSmall}>🔍</Text>
            </View>
            <View>
              <Text style={styles.choiceTitle}>No, Help Me Discover</Text>
              <Text style={styles.choiceText}>I'll track and find patterns</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {step === "allergy-select" && (
        <View style={styles.panel}>
          <Text style={styles.title}>Select Your Known Allergens</Text>
          <Text style={styles.subtitle}>
            We'll highlight these in scanned products
          </Text>

          <View style={styles.grid}>
            {COMMON_ALLERGENS.map((allergen) => {
              const isSelected = selectedAllergens.includes(allergen.id);
              return (
                <TouchableOpacity
                  key={allergen.id}
                  onPress={() => toggleAllergen(allergen.id)}
                  style={[
                    styles.allergenCard,
                    isSelected && styles.allergenCardSelected,
                  ]}
                >
                  <Text style={styles.allergenEmoji}>{allergen.emoji}</Text>
                  <Text
                    style={[
                      styles.allergenLabel,
                      isSelected && styles.allergenLabelSelected,
                    ]}
                  >
                    {allergen.label}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check"
                      size={14}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Other Allergens</Text>
            <View style={styles.customRow}>
              <TextInput
                style={styles.inputSmall}
                placeholder="Add custom allergen..."
                placeholderTextColor={colors.muted}
                value={customAllergen}
                onChangeText={setCustomAllergen}
              />
              <TouchableOpacity
                onPress={addCustomAllergen}
                style={styles.iconButton}
              >
                <Feather name="plus" size={16} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
            {customAllergens.length > 0 && (
              <View style={styles.customChips}>
                {customAllergens.map((a) => (
                  <View key={a} style={styles.customChip}>
                    <Text style={styles.customChipText}>{a}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setCustomAllergens((prev) => prev.filter((x) => x !== a))
                      }
                    >
                      <Feather name="x" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => setStep("allergy-question")}
            >
              <Text style={styles.outlineButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveAllergens}
              disabled={selectedAllergens.length === 0 && customAllergens.length === 0}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </ScrollView>
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
}) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 32,
      justifyContent: "center",
    },
    topBar: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
    },
    topSpacer: {
      flex: 1,
    },
    panel: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      gap: 12,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    emoji: {
      fontSize: 30,
    },
    emojiSmall: {
      fontSize: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginTop: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 8,
    },
    formBlock: {
      gap: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 12,
      color: colors.text,
      backgroundColor: colors.card,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontSize: 13,
      fontWeight: "600",
    },
    choiceCard: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
    },
    choiceIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    choiceTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    choiceText: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 2,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 12,
    },
    allergenCard: {
      width: "30%",
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      backgroundColor: colors.card,
      gap: 4,
    },
    allergenCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    allergenEmoji: {
      fontSize: 18,
    },
    allergenLabel: {
      fontSize: 10,
      color: colors.text,
      textAlign: "center",
    },
    allergenLabelSelected: {
      color: colors.primary,
      fontWeight: "600",
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    customRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
    },
    inputSmall: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 12,
      color: colors.text,
      backgroundColor: colors.card,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    customChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    customChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    customChipText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    actionRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    outlineButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
    },
    outlineButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
  });
