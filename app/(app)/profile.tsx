/*
  profile.tsx

  User profile screen where the user can view and edit their name, age,
  and known allergens. Also exposes logout and a short notice about the
  app's non-medical nature.
*/
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../hooks/use-toast";

const COMMON_ALLERGENS = [
  { id: "nuts", label: "Nuts", emoji: "🥜" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "wheat", label: "Wheat", emoji: "🌾" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "seafood", label: "Seafood", emoji: "🦐" },
];

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age ? String(user.age) : "",
  });

  const knownAllergens = user?.knownAllergens || [];
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(
    knownAllergens
  );
  const [customAllergen, setCustomAllergen] = useState("");

  const customSelected = useMemo(
    () =>
      selectedAllergens.filter(
        (a) => !COMMON_ALLERGENS.find((c) => c.id === a)
      ),
    [selectedAllergens]
  );

  const toggleAllergen = (id: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const addCustomAllergen = () => {
    const trimmed = customAllergen.trim().toLowerCase();
    if (trimmed && !selectedAllergens.includes(trimmed)) {
      setSelectedAllergens((prev) => [...prev, trimmed]);
      setCustomAllergen("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setSelectedAllergens((prev) => prev.filter((a) => a !== allergen));
  };

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      knownAllergens: selectedAllergens,
      eliminationMode: selectedAllergens.length > 0,
    });
    setIsEditing(false);
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
            ) : (
              <Feather name="user" size={38} color={colors.muted} />
            )}
          </View>
          {isEditing ? (
            <View style={styles.avatarBadge}>
              <Feather name="camera" size={14} color={colors.primaryText} />
            </View>
          ) : (
            <>
              <Text style={styles.nameText}>{user?.name}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </>
          )}
        </View>

        <View style={styles.formBlock}>
          <Text style={styles.label}>
            <Feather name="user" size={14} color={colors.muted} /> Name
          </Text>
          {isEditing ? (
            <TextInput
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.muted}
            />
          ) : (
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{user?.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.formBlock}>
          <Text style={styles.label}>
            <Feather name="calendar" size={14} color={colors.muted} /> Age
          </Text>
          {isEditing ? (
            <TextInput
              value={formData.age}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, age: text }))
              }
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
            />
          ) : (
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{user?.age || "Not set"}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="shield" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Known Allergens</Text>
        </View>

        {isEditing ? (
          <>
            <View style={styles.grid}>
              {COMMON_ALLERGENS.map((allergen) => {
                const selected = selectedAllergens.includes(allergen.id);
                return (
                  <TouchableOpacity
                    key={allergen.id}
                    onPress={() => toggleAllergen(allergen.id)}
                    style={[
                      styles.allergenCard,
                      selected && styles.allergenCardSelected,
                    ]}
                  >
                    <Text style={styles.allergenEmoji}>{allergen.emoji}</Text>
                    <Text
                      style={[
                        styles.allergenLabel,
                        selected && styles.allergenLabelSelected,
                      ]}
                    >
                      {allergen.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.customRow}>
              <TextInput
                value={customAllergen}
                onChangeText={setCustomAllergen}
                placeholder="Add custom..."
                style={styles.inputSmall}
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity
                onPress={addCustomAllergen}
                style={styles.iconButton}
              >
                <Feather name="plus" size={16} color={colors.primaryText} />
              </TouchableOpacity>
            </View>

            {customSelected.length > 0 && (
              <View style={styles.customChips}>
                {customSelected.map((allergen) => (
                  <View key={allergen} style={styles.customChip}>
                    <Text style={styles.customChipText}>{allergen}</Text>
                    <TouchableOpacity onPress={() => removeAllergen(allergen)}>
                      <Feather name="x" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.chipRow}>
            {knownAllergens.length > 0 ? (
              knownAllergens.map((allergen) => {
                const common = COMMON_ALLERGENS.find((c) => c.id === allergen);
                return (
                  <View key={allergen} style={styles.displayChip}>
                    <Text style={styles.displayChipText}>
                      {common ? `${common.emoji} ${common.label}` : allergen}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No known allergens set</Text>
            )}
          </View>
        )}
      </View>

      {isEditing && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setSelectedAllergens(knownAllergens);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Feather name="save" size={16} color={colors.primaryText} />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.noticeCard}>
        <View style={styles.noticeRow}>
          <Feather name="alert-triangle" size={18} color={colors.warning} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Important Notice</Text>
            <Text style={styles.noticeText}>
              This app tracks patterns only. It is not a medical diagnosis tool.
              Please consult a healthcare provider for proper allergy testing and
              treatment.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Feather name="log-out" size={16} color={colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
  warningBg: string;
  danger: string;
  dangerBg: string;
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
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  editButton: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emailText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
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
  readonlyBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readonlyText: {
    fontSize: 12,
    color: colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  allergenCard: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  allergenCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  allergenEmoji: {
    fontSize: 18,
  },
  allergenLabel: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
  },
  allergenLabelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
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
    marginTop: 12,
  },
  customChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  displayChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  displayChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
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
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  saveText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "600",
  },
  noticeCard: {
    backgroundColor: colors.warningBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  noticeRow: {
    flexDirection: "row",
    gap: 10,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: colors.muted,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.dangerBg,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: "600",
  },
});


