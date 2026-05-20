/*
    AuthContext.tsx

    Provides a simple client-side authentication context for the app.
    - stores users and the current session in AsyncStorage (local device storage)
    - exposes `login`, `signup`, `logout`, `updateProfile` and a helper to
        create temporary demo profiles for testing the app UI and flows.

    Note: This is a local mock auth implementation for demo/testing only
    and should not be used as-is in production where a secure backend is required.
*/
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import React, { createContext, useContext, useEffect, useState } from "react";

// Public user object (no password)
export interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
    photoUrl?: string;
    knownAllergens?: string[];
    eliminationMode?: boolean;
}

// Stored user includes password (persisted locally in AsyncStorage in this demo)
interface StoredUser extends User {
    password: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    signup: (
        name: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    createTemporaryTestProfile: (
        profileType: "allergic-only" | "one-allergen-mixed" | "random-signs"
    ) => Promise<{ success: boolean; error?: string }>;
}

// Create the React context used across the app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "allergyTracker_users";
const CURRENT_USER_KEY = "allergyTracker_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved session
    useEffect(() => {
        const loadUser = async () => {
            const savedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    // Attempt to log a user in using locally stored credentials.
    // Returns an object describing success and an optional error message.
    const login = async (email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const savedUsersRaw = await AsyncStorage.getItem(USERS_KEY);
        const savedUsers: StoredUser[] = savedUsersRaw
            ? JSON.parse(savedUsersRaw)
            : [];

        const foundUser = savedUsers.find((u) => u.email === email);

        if (!foundUser) {
            return { success: false, error: "No account found with this email" };
        }

        if (foundUser.password !== password) {
            return { success: false, error: "Incorrect password" };
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(userWithoutPassword)
        );

        return { success: true };
    };

    // Create a new user and persist to AsyncStorage (demo signup)
    const signup = async (name: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const savedUsersRaw = await AsyncStorage.getItem(USERS_KEY);
        const savedUsers: StoredUser[] = savedUsersRaw
            ? JSON.parse(savedUsersRaw)
            : [];

        if (savedUsers.some((u) => u.email === email)) {
            return {
                success: false,
                error: "An account with this email already exists",
            };
        }

        const newUser: StoredUser = {
            id: Crypto.randomUUID(),
            name,
            email,
            password,
        };

        const updatedUsers = [...savedUsers, newUser];
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(userWithoutPassword)
        );

        return { success: true };
    };

    // Clear current session
    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
    };

    // Update profile for current user and persist changes
    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(updatedUser)
        );

        const savedUsersRaw = await AsyncStorage.getItem(USERS_KEY);
        const savedUsers: StoredUser[] = savedUsersRaw
            ? JSON.parse(savedUsersRaw)
            : [];

        const index = savedUsers.findIndex((u) => u.id === user.id);

        if (index !== -1) {
            savedUsers[index] = { ...savedUsers[index], ...updates };
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(savedUsers));
        }
    };

    // Create a seeded temporary demo user with sample ingredients/symptoms.
    // Useful for trying the app without creating a real account.
    const createTemporaryTestProfile = async (
        profileType: "allergic-only" | "one-allergen-mixed" | "random-signs"
    ) => {
        try {
            const demoUserId = `__temporary_test_user__${profileType}`;
            const demoEmail = `temporary.${profileType}@allersense.local`;
            const demoPassword = "test1234";

            const today = new Date();
            const dayOffset = (daysBack: number) => {
                const d = new Date(today);
                d.setDate(today.getDate() - daysBack);
                return d.toISOString().slice(0, 10);
            };

            const buildProfileData = () => {
                if (profileType === "allergic-only") {
                    const knownAllergens = ["peanut", "milk", "soy", "tomato"];
                    const ingredients = [
                        { id: "p1-i1", foodName: "Peanuts, peanut oil", date: dayOffset(2), time: "08:30", source: "manual" },
                        { id: "p1-i2", foodName: "Paneer butter masala, cream", date: dayOffset(2), time: "13:10", source: "manual" },
                        { id: "p1-i3", foodName: "Soy sauce noodles, garlic", date: dayOffset(2), time: "20:00", source: "manual" },
                        { id: "p1-i4", foodName: "Tomato soup, croutons", date: dayOffset(1), time: "09:00", source: "manual" },
                        { id: "p1-i5", foodName: "Kheer, milk, dry fruits", date: dayOffset(1), time: "14:00", source: "manual" },
                        { id: "p1-i6", foodName: "Poha, peanuts, chili", date: dayOffset(0), time: "08:20", source: "manual" },
                        { id: "p1-i7", foodName: "Hakka noodles, soy sauce", date: dayOffset(0), time: "20:30", source: "manual" },
                    ];
                    const symptoms = [
                        { id: "p1-s1", symptomName: "Hives", date: dayOffset(2), time: "10:00", severity: 4, notes: "After peanuts" },
                        { id: "p1-s2", symptomName: "Rash", date: dayOffset(2), time: "15:00", severity: 3, notes: "After paneer lunch" },
                        { id: "p1-s3", symptomName: "Stomach cramps", date: dayOffset(2), time: "21:15", severity: 4, notes: "After soy noodles" },
                        { id: "p1-s4", symptomName: "Heartburn", date: dayOffset(1), time: "10:30", severity: 3, notes: "After tomato soup" },
                        { id: "p1-s5", symptomName: "Diarrhea", date: dayOffset(1), time: "16:00", severity: 3, notes: "After milk dessert" },
                        { id: "p1-s6", symptomName: "Breathing difficulty", date: dayOffset(0), time: "09:30", severity: 5, notes: "Peanut reaction" },
                        { id: "p1-s7", symptomName: "Nausea", date: dayOffset(0), time: "22:00", severity: 3, notes: "Post dinner" },
                    ];
                    return { knownAllergens, ingredients, symptoms, age: 26, name: "Temp Profile 1 - Allergic Only" };
                }

                if (profileType === "one-allergen-mixed") {
                    const knownAllergens = ["peanut"];
                    const ingredients = [
                        { id: "p2-i1", foodName: "Oats, banana, honey", date: dayOffset(6), time: "08:00", source: "manual" },
                        { id: "p2-i2", foodName: "Rice, dal, cucumber salad", date: dayOffset(6), time: "13:00", source: "manual" },
                        { id: "p2-i3", foodName: "Chapati, aloo sabzi", date: dayOffset(6), time: "20:00", source: "manual" },
                        { id: "p2-i4", foodName: "Poha, peanuts, onion", date: dayOffset(5), time: "08:20", source: "manual" },
                        { id: "p2-i5", foodName: "Idli, sambar, coconut chutney", date: dayOffset(5), time: "13:10", source: "manual" },
                        { id: "p2-i6", foodName: "Vegetable pulao, raita", date: dayOffset(5), time: "20:15", source: "manual" },
                        { id: "p2-i7", foodName: "Fruit bowl, apple, papaya", date: dayOffset(4), time: "08:10", source: "manual" },
                        { id: "p2-i8", foodName: "Rajma chawal, salad", date: dayOffset(4), time: "13:00", source: "manual" },
                        { id: "p2-i9", foodName: "Sabudana khichdi, peanuts", date: dayOffset(4), time: "19:45", source: "manual" },
                        { id: "p2-i10", foodName: "Upma, vegetables", date: dayOffset(3), time: "08:00", source: "manual" },
                        { id: "p2-i11", foodName: "Chicken curry, rice", date: dayOffset(3), time: "13:30", source: "manual" },
                        { id: "p2-i12", foodName: "Groundnut chutney sandwich", date: dayOffset(3), time: "20:20", source: "manual" },
                        { id: "p2-i13", foodName: "Dosa, potato masala", date: dayOffset(2), time: "08:30", source: "manual" },
                        { id: "p2-i14", foodName: "Paneer tikka, roti", date: dayOffset(2), time: "13:15", source: "manual" },
                        { id: "p2-i15", foodName: "Chikki, tea", date: dayOffset(2), time: "18:10", source: "manual" },
                        { id: "p2-i16", foodName: "Veg soup, bread", date: dayOffset(2), time: "20:30", source: "manual" },
                        { id: "p2-i17", foodName: "Cornflakes, milk", date: dayOffset(1), time: "08:10", source: "manual" },
                        { id: "p2-i18", foodName: "Lemon rice, curd", date: dayOffset(1), time: "13:10", source: "manual" },
                        { id: "p2-i19", foodName: "Poha with peanuts", date: dayOffset(1), time: "20:00", source: "manual" },
                        { id: "p2-i20", foodName: "Paratha, curd", date: dayOffset(0), time: "08:00", source: "manual" },
                        { id: "p2-i21", foodName: "Khichdi, papad", date: dayOffset(0), time: "13:00", source: "manual" },
                        { id: "p2-i22", foodName: "Murmura chaat, roasted peanuts", date: dayOffset(0), time: "17:40", source: "manual" },
                        { id: "p2-i23", foodName: "Dal, rice, bhindi", date: dayOffset(0), time: "20:20", source: "manual" },
                        { id: "p2-i24", foodName: "Banana smoothie", date: dayOffset(0), time: "22:00", source: "manual" },
                    ];
                    const symptoms = [
                        { id: "p2-s1", symptomName: "Hives", date: dayOffset(5), time: "10:00", severity: 3, notes: "After peanut breakfast" },
                        { id: "p2-s2", symptomName: "Nausea", date: dayOffset(4), time: "21:00", severity: 2, notes: "After sabudana peanuts" },
                        { id: "p2-s3", symptomName: "Swelling", date: dayOffset(3), time: "22:00", severity: 4, notes: "After groundnut chutney" },
                        { id: "p2-s4", symptomName: "Hives", date: dayOffset(2), time: "19:30", severity: 3, notes: "After chikki" },
                        { id: "p2-s5", symptomName: "Breathing difficulty", date: dayOffset(1), time: "21:10", severity: 5, notes: "After poha with peanuts" },
                        { id: "p2-s6", symptomName: "Itching", date: dayOffset(0), time: "18:30", severity: 2, notes: "After roasted peanuts" },
                    ];
                    return { knownAllergens, ingredients, symptoms, age: 29, name: "Temp Profile 2 - One Allergen Mixed" };
                }

              const knownAllergens = ["peanut", "milk", "shrimp", "soy"];
              const ingredients = [
                  { id: "p3-i1", foodName: "Overnight oats, banana, almond milk", date: dayOffset(6), time: "08:05", source: "manual" },
                  { id: "p3-i2", foodName: "Veggie wrap, hummus", date: dayOffset(6), time: "13:15", source: "manual" },
                  { id: "p3-i3", foodName: "Chicken stew, brown rice", date: dayOffset(6), time: "19:45", source: "manual" },
                  { id: "p3-i4", foodName: "Peanut chikki, tea", date: dayOffset(5), time: "17:40", source: "manual" },
                  { id: "p3-i5", foodName: "Curd rice", date: dayOffset(5), time: "20:10", source: "manual" },
                  { id: "p3-i6", foodName: "Fruit bowl, chia seeds", date: dayOffset(4), time: "08:10", source: "manual" },
                  { id: "p3-i7", foodName: "Tofu stir-fry, soy sauce", date: dayOffset(4), time: "13:25", source: "manual" },
                  { id: "p3-i8", foodName: "Dal, roti, salad", date: dayOffset(4), time: "20:05", source: "manual" },
                  { id: "p3-i9", foodName: "Egg sandwich, oat milk latte", date: dayOffset(3), time: "08:00", source: "manual" },
                  { id: "p3-i10", foodName: "Shrimp fried rice", date: dayOffset(3), time: "13:05", source: "manual" },
                  { id: "p3-i11", foodName: "Tomato soup, garlic bread", date: dayOffset(3), time: "20:15", source: "manual" },
                  { id: "p3-i12", foodName: "Granola bar, peanuts", date: dayOffset(2), time: "10:30", source: "manual" },
                  { id: "p3-i13", foodName: "Pasta primavera, parmesan", date: dayOffset(2), time: "13:10", source: "manual" },
                  { id: "p3-i14", foodName: "Tofu bowl, edamame", date: dayOffset(2), time: "19:50", source: "manual" },
                  { id: "p3-i15", foodName: "Idli, coconut chutney", date: dayOffset(1), time: "08:20", source: "manual" },
                  { id: "p3-i16", foodName: "Paneer tikka, mint chutney", date: dayOffset(1), time: "13:00", source: "manual" },
                  { id: "p3-i17", foodName: "Quinoa salad, avocado", date: dayOffset(1), time: "20:10", source: "manual" },
                  { id: "p3-i18", foodName: "Cereal with milk", date: dayOffset(0), time: "08:00", source: "manual" },
                  { id: "p3-i19", foodName: "Veg pulao, raita", date: dayOffset(0), time: "13:20", source: "manual" },
                  { id: "p3-i20", foodName: "Chicken curry, rice", date: dayOffset(0), time: "20:05", source: "manual" },
                  { id: "p3-i21", foodName: "Prawn curry, rice", date: dayOffset(1), time: "20:30", source: "manual" },
              ];
              const symptoms = [
                  { id: "p3-s1", symptomName: "Hives", date: dayOffset(5), time: "19:10", severity: 3, notes: "After peanut chikki" },
                  { id: "p3-s2", symptomName: "Diarrhea", date: dayOffset(5), time: "22:00", severity: 3, notes: "After curd rice" },
                  { id: "p3-s3", symptomName: "Throat swelling", date: dayOffset(3), time: "14:30", severity: 4, notes: "After shrimp fried rice" },
                  { id: "p3-s4", symptomName: "Nausea", date: dayOffset(2), time: "11:45", severity: 2, notes: "After granola bar with peanuts" },
                  { id: "p3-s5", symptomName: "Shortness of breath", date: dayOffset(1), time: "21:10", severity: 4, notes: "After prawn curry" },
                  { id: "p3-s6", symptomName: "Rash", date: dayOffset(0), time: "09:30", severity: 3, notes: "After cereal with milk" },
                  { id: "p3-s7", symptomName: "Nausea", date: dayOffset(4), time: "14:10", severity: 2, notes: "After tofu stir-fry" },
                  { id: "p3-s8", symptomName: "Stomach cramps", date: dayOffset(2), time: "21:05", severity: 2, notes: "After tofu bowl" },
                  { id: "p3-s9", symptomName: "Vomiting", date: dayOffset(1), time: "14:20", severity: 3, notes: "After paneer tikka" },
                  { id: "p3-s10", symptomName: "Diarrhea", date: dayOffset(0), time: "10:05", severity: 3, notes: "After cereal with milk" },
                  { id: "p3-s11", symptomName: "Hives", date: dayOffset(0), time: "18:40", severity: 3, notes: "After peanut snack" },
              ];
              return { knownAllergens, ingredients, symptoms, age: 34, name: "Temp Profile 3 - Rhea K. (Multi-Allergy Tracking)" };
            };

            const profile = buildProfileData();

            const demoUser: StoredUser = {
                id: demoUserId,
                name: profile.name,
                email: demoEmail,
                password: demoPassword,
                knownAllergens: profile.knownAllergens,
                eliminationMode: true,
                age: profile.age,
            };

            const ingredientsKey = `allergyTracker_${demoUserId}_ingredients`;
            const symptomsKey = `allergyTracker_${demoUserId}_symptoms`;
            const overridesKey = `allergyTracker_${demoUserId}_overrides`;

            const savedUsersRaw = await AsyncStorage.getItem(USERS_KEY);
            const savedUsers: StoredUser[] = savedUsersRaw
                ? JSON.parse(savedUsersRaw)
                : [];

            const existingIdx = savedUsers.findIndex((u) => u.id === demoUserId);
            if (existingIdx >= 0) {
                savedUsers[existingIdx] = demoUser;
            } else {
                savedUsers.push(demoUser);
            }

            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(savedUsers));
            await AsyncStorage.setItem(ingredientsKey, JSON.stringify(profile.ingredients));
            await AsyncStorage.setItem(symptomsKey, JSON.stringify(profile.symptoms));
            await AsyncStorage.setItem(overridesKey, JSON.stringify({}));

            const { password: _, ...userWithoutPassword } = demoUser;
            setUser(userWithoutPassword);
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

            return { success: true };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to create test profile";
            return { success: false, error: message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                signup,
                logout,
                updateProfile,
                createTemporaryTestProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
