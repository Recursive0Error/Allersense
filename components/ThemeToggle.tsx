import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme, colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.button, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
        >
            <View style={styles.iconWrap}>
                <Feather
                    name={theme === "dark" ? "moon" : "sun"}
                    size={16}
                    color={colors.text}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
});
