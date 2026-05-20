/*
  scanner.tsx

  UI for scanning or uploading an image of an ingredient list.
  - image OCR is not integrated; the screen simulates a scan and lets
    the user review/edit detected ingredients before saving them to the log.
*/
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AnimatedScreen } from "../../components/AnimatedScreen";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../hooks/use-toast";
import { to24HourTime } from "../../utils/time";

type ScannerMode = "camera" | "scanning" | "results" | "confirm";

export default function Scanner() {
  const { user } = useAuth();
  const { addIngredient } = useData();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [mode, setMode] = useState<ScannerMode>("camera");
  const [scanProgress, setScanProgress] = useState(0);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [editableIngredients, setEditableIngredients] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [mealTime, setMealTime] = useState(format(new Date(), "hh:mm a"));
  const [allergenWarnings, setAllergenWarnings] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [spinAnimation] = useState(new Animated.Value(0));

  const knownAllergens = user?.knownAllergens || [];

  useEffect(() => {
    if (mode === "scanning") {
      spinAnimation.setValue(0);
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [mode, spinAnimation]);

  const checkForAllergens = useCallback(
    (ingredientList: string[]) => {
      const warnings: string[] = [];
      const lowerIngredients = ingredientList.map((i) => i.toLowerCase());

      knownAllergens.forEach((allergen) => {
        const found = lowerIngredients.some((ing) =>
          ing.includes(allergen.toLowerCase())
        );
        if (found) warnings.push(allergen);
      });

      setAllergenWarnings(warnings);
    },
    [knownAllergens]
  );

  const parseIngredients = useCallback((text: string): string[] => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const items = lines
      .join(" ")
      .split(/[,;]/)
      .map((item) =>
        item.replace(/^\s*[-–—•]\s*/, "").replace(/\s+/g, " ").trim()
      )
      .filter((item) => item.length > 1 && item.length < 80);

    return [...new Set(items)];
  }, []);

  const simulateScan = (text = "") => {
    setMode("scanning");
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(prev + 20, 100);
        if (next === 100) {
          clearInterval(interval);
          const parsedIngredients = parseIngredients(text);
          setIngredients(parsedIngredients);
          setEditableIngredients(parsedIngredients.join("\n"));
          checkForAllergens(parsedIngredients);
          setMode("results");
        }
        return next;
      });
    }, 250);
  };

  const pickImage = async (fromCamera: boolean) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (fromCamera && status !== "granted") {
      toast({
        title: "Camera Error",
        description: "Camera permission is required to take a photo.",
        variant: "destructive",
      });
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.7,
          allowsEditing: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
          allowsEditing: true,
        });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      // OCR is not configured in RN; jump to results for manual review.
      simulateScan("");
    }
  };

  const handleConfirmIngredients = () => {
    if (isEditing) {
      const newIngredients = editableIngredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
      setIngredients(newIngredients);
      checkForAllergens(newIngredients);
      setIsEditing(false);
    }
    setMode("confirm");
  };

  const handleSaveIngredients = () => {
    const today = format(new Date(), "yyyy-MM-dd");

    ingredients.forEach((ingredient) => {
      addIngredient({
        foodName: ingredient,
        time: to24HourTime(mealTime),
        date: today,
        source: "scanned",
      });
    });

    toast({
      title: "Ingredients Saved!",
      description: `${ingredients.length} ingredients added to your log.`,
    });

    setMode("camera");
    setIngredients([]);
    setEditableIngredients("");
    setAllergenWarnings([]);
    setImageUri(null);
  };

  const warningText = useMemo(
    () => (allergenWarnings.length > 0 ? allergenWarnings.join(", ") : ""),
    [allergenWarnings]
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
    <AnimatedScreen style={{ flex: 1 }}>
      {mode === "camera" && (
        <View style={styles.stage}>
          <Text style={styles.title}>Scan Ingredients</Text>
          <Text style={styles.subtitle}>
            Take a photo of the ingredient list on food packaging
          </Text>

          <View style={styles.preview}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <View style={styles.previewIcon}>
                <Feather name="camera" size={30} color={colors.primary} />
                </View>
                <Text style={styles.previewText}>
                  Point camera at the ingredients list on the package
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionColumn}>
            <TouchableOpacity
              onPress={() => pickImage(true)}
              style={styles.primaryButton}
            >
              <Feather name="camera" size={18} color={colors.primaryText} />
              <Text style={styles.primaryButtonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickImage(false)}
              style={styles.secondaryButton}
            >
              <Feather name="upload" size={18} color={colors.text} />
              <Text style={styles.secondaryButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {mode === "scanning" && (
        <View style={styles.stage}>
          <View style={styles.center}>
            <Animated.View
              style={[
                styles.spinner,
                {
                  transform: [
                    {
                      rotate: spinAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.scanTitle}>Scanning Ingredients...</Text>
            <Text style={styles.subtitle}>Reading text from image</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${scanProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{scanProgress}%</Text>
          </View>
        </View>
      )}

      {mode === "results" && (
        <ScrollView contentContainerStyle={styles.stage}>
          <Text style={styles.title}>Detected Ingredients</Text>
          <Text style={styles.subtitle}>Review and edit if needed</Text>

          {allergenWarnings.length > 0 && (
            <View style={styles.warningCard}>
              <Feather name="alert-triangle" size={18} color={colors.danger} />
              <View style={styles.warningCopy}>
                <Text style={styles.warningTitle}>
                  ⚠️ Contains Your Known Allergens
                </Text>
                <Text style={styles.warningText}>{warningText}</Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {ingredients.length} ingredients found
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditing((prev) => !prev)}
                style={styles.textButton}
              >
              <Feather name="edit-2" size={14} color={colors.primary} />
                <Text style={styles.textButtonLabel}>
                  {isEditing ? "Done" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <TextInput
                style={styles.textarea}
                value={editableIngredients}
                onChangeText={setEditableIngredients}
                placeholder="One ingredient per line..."
                placeholderTextColor={colors.muted}
                multiline
              />
            ) : (
              <View style={styles.ingredientWrap}>
                {ingredients.map((ingredient, index) => {
                  const isAllergen = knownAllergens.some((a) =>
                    ingredient.toLowerCase().includes(a.toLowerCase())
                  );
                  return (
                    <View
                      key={`${ingredient}-${index}`}
                      style={[
                        styles.ingredientChip,
                        isAllergen && styles.ingredientChipWarning,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ingredientText,
                          isAllergen && styles.ingredientTextWarning,
                        ]}
                      >
                        {isAllergen ? "⚠️ " : ""}
                        {ingredient}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setMode("camera")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Rescan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmIngredients}
              style={styles.primaryButton}
            >
              <Feather name="check" size={16} color={colors.primaryText} />
              <Text style={styles.primaryButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {mode === "confirm" && (
        <ScrollView contentContainerStyle={styles.stage}>
          <Text style={styles.title}>When Did You Eat This?</Text>
          <Text style={styles.subtitle}>
            This helps us track symptom correlations
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={styles.cardTitle}>Meal Time</Text>
            </View>
            <TextInput
              style={styles.input}
              value={mealTime}
              onChangeText={setMealTime}
              placeholder="hh:mm AM/PM"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>
              Adding {ingredients.length} ingredients:
            </Text>
            <Text style={styles.cardTitle}>
              {ingredients.slice(0, 5).join(", ")}
              {ingredients.length > 5 && ` +${ingredients.length - 5} more`}
            </Text>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setMode("results")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveIngredients}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Save to Log</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  warningBg: string;
  danger: string;
  dangerBg: string;
}) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stage: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 12,
  },
  preview: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    overflow: "hidden",
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  actionColumn: {
    gap: 12,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: colors.primary,
    borderTopColor: "transparent",
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  warningCard: {
    backgroundColor: colors.dangerBg,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  warningCopy: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
  },
  warningText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  textButton: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  textButtonLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
  textarea: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    textAlignVertical: "top",
    color: colors.text,
    backgroundColor: colors.surface,
  },
  ingredientWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ingredientChipWarning: {
    backgroundColor: colors.dangerBg,
  },
  ingredientText: {
    fontSize: 12,
    color: colors.text,
  },
  ingredientTextWarning: {
    color: colors.danger,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
