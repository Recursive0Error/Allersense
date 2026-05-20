/*
    ThemeContext.tsx

    Provides a theme and color palette to the rest of the app. Stores the
    user's theme preference in AsyncStorage and exposes `setTheme` / `toggleTheme`.
*/
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "dark";

export type ThemeColors = {
    background: string;
    card: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primaryText: string;
    accent: string;
    warning: string;
    warningBg: string;
    danger: string;
    dangerBg: string;
    success: string;
};

type ThemeContextValue = {
    theme: ThemeName;
    colors: ThemeColors;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
};

const THEME_KEY = "allersense_theme";

const themes: Record<ThemeName, ThemeColors> = {
    light: {
        background: "#f1f6ea",
        card: "#ffffff",
        surface: "#edf4e4",
        text: "#111827",
        muted: "#6b7280",
        border: "#d8e7c7",
        primary: "#2aa54a",
        primaryText: "#ffffff",
        accent: "#2f8f46",
        warning: "#b45309",
        warningBg: "#fef3c7",
        danger: "#dc2626",
        dangerBg: "#fee2e2",
        success: "#2aa54a",
    },
    dark: {
        background: "#0c0d0a",
        card: "#11140f",
        surface: "#161a13",
        text: "#f9fafb",
        muted: "#9ca3af",
        border: "#1f251a",
        primary: "#2fb05a",
        primaryText: "#0c0d0a",
        accent: "#2f9a52",
        warning: "#f59e0b",
        warningBg: "#3b2f07",
        danger: "#f87171",
        dangerBg: "#3b0a0a",
        success: "#2fb05a",
    },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName>("light");

    useEffect(() => {
        const loadTheme = async () => {
            const stored = await AsyncStorage.getItem(THEME_KEY);
            if (stored === "light" || stored === "dark") {
                setThemeState(stored);
            }
        };
        loadTheme();
    }, []);

    const setTheme = (next: ThemeName) => {
        setThemeState(next);
        AsyncStorage.setItem(THEME_KEY, next);
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const value = useMemo(
        () => ({
            theme,
            colors: themes[theme],
            setTheme,
            toggleTheme,
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
