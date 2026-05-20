/*
    allergy-setup.tsx

    Small setup screen alternative to `profile-setup` that asks the user
    whether they know their allergy and allows quick selection of common allergens.
*/
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const COMMON_ALLERGENS = [
    { id: "nuts", label: "Nuts", emoji: "🥜" },
    { id: "dairy", label: "Dairy", emoji: "🥛" },
    { id: "wheat", label: "Wheat", emoji: "🌾" },
    { id: "soy", label: "Soy", emoji: "🫘" },
    { id: "eggs", label: "Eggs", emoji: "🥚" },
    { id: "seafood", label: "Seafood", emoji: "🦐" },
];

type SetupMode = 'question' | 'known-allergies';

export default function AllergySetupScreen() {
    const router = useRouter();
    const { updateProfile } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [mode, setMode] = useState<SetupMode>('question');
    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
    const [customAllergen, setCustomAllergen] = useState('');
    const [customAllergens, setCustomAllergens] = useState<string[]>([]);

    const toggleAllergen = (id: string) => {
        setSelectedAllergens((prev) =>
            prev.includes(id)
                ? prev.filter((a) => a !== id)
                : [...prev, id]
        );
    };

    const addCustomAllergen = () => {
        const trimmed = customAllergen.trim().toLowerCase();
        if (trimmed && !customAllergens.includes(trimmed)) {
            setCustomAllergens((prev) => [...prev, trimmed]);
            setCustomAllergen('');
        }
    };

    const removeCustomAllergen = (allergen: string) => {
        setCustomAllergens((prev) =>
            prev.filter((a) => a !== allergen)
        );
    };

    const handleDontKnow = () => {
        updateProfile({ knownAllergens: [], eliminationMode: false });
        Alert.alert('Great!', 'Start logging your foods and symptoms.');
        router.push("/home");
    };

    const handleSaveAllergens = () => {
        const allAllergens = [...selectedAllergens, ...customAllergens];

        updateProfile({
            knownAllergens: allAllergens,
            eliminationMode: true,
        });

        Alert.alert('Saved!', 'Your allergies have been saved.');
        router.push("/home");
    };

    if (mode === 'question') {
        return (
            <View style={[styles.container, styles.screen]}>
                <Text style={styles.title}>
                    Do You Already Know Your Allergy?
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleDontKnow}
                >
                    <Text style={styles.buttonText}>
                        I Don't Know My Trigger
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setMode('known-allergies')}
                >
                    <Text style={styles.buttonText}>
                        I Know My Allergy
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                Select Your Known Allergens
            </Text>

            <View style={styles.grid}>
                {COMMON_ALLERGENS.map((item) => {
                    const isSelected =
                        selectedAllergens.includes(item.id);

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.allergenBox,
                                isSelected && styles.selectedBox,
                            ]}
                            onPress={() => toggleAllergen(item.id)}
                        >
                            <Text style={styles.emoji}>
                                {item.emoji}
                            </Text>
                            <Text style={styles.bodyText}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Text style={styles.subtitle}>
                Add Custom Allergen
            </Text>

            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter allergen"
                    placeholderTextColor={colors.muted}
                    value={customAllergen}
                    onChangeText={setCustomAllergen}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addCustomAllergen}
                >
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {customAllergens.map((item) => (
                <View key={item} style={styles.chip}>
                    <Text style={styles.bodyText}>{item}</Text>
                    <TouchableOpacity
                        onPress={() => removeCustomAllergen(item)}
                    >
                        <Text style={styles.iconText}>❌</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setMode('question')}
                >
                    <Text style={styles.bodyText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSaveAllergens}
                >
                    <Text style={styles.buttonText}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
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
    success: string;
}) =>
    StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: colors.text,
    },
    subtitle: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
        color: colors.text,
    },
    bodyText: {
        color: colors.text,
    },
    button: {
        backgroundColor: colors.success,
        padding: 15,
        borderRadius: 12,
        marginVertical: 8,
    },
    buttonText: {
        color: colors.primaryText,
        textAlign: 'center',
    },
    iconText: {
        marginLeft: 6,
        color: colors.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    allergenBox: {
        width: '48%',
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedBox: {
        backgroundColor: colors.surface,
    },
    emoji: {
        fontSize: 24,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 10,
        color: colors.text,
    },
    addButton: {
        backgroundColor: colors.success,
        padding: 10,
        marginLeft: 10,
        borderRadius: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 8,
        borderRadius: 20,
        marginVertical: 4,
        alignSelf: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
    },
    primaryButton: {
        backgroundColor: colors.success,
        padding: 15,
        borderRadius: 12,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 12,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
});


