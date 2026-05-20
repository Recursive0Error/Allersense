/*
  auth.tsx

  Authentication screen that handles login, signup and temporary demo profiles.
  - uses `zod` for client-side validation of forms
  - calls `useAuth()` methods to perform login/signup
  - offers demo profiles to seed local test data
*/
import { Feather } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
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
import { z } from "zod";
import { Logo } from "../components/ui/Logo";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";

// Input validation schemas (client-side)
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AuthMode = "landing" | "login" | "signup" | "forgot";

export default function Auth() {
  const router = useRouter();
  const { user, login, signup, createTemporaryTestProfile } = useAuth();
  const { toast } = useToast();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [mode, setMode] = useState<AuthMode>("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If a user already exists in context, move them to profile setup
  if (user) {
    return <Redirect href="/profile-setup" />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Validate form then call `login` from AuthContext
  const handleLogin = async () => {
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsLoading(true);
      const { success, error } = await login(formData.email, formData.password);

      if (success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        router.replace("/(app)/home");
      } else {
        setErrors({ general: error || "Login failed" });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Login error:", error);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Validate form then call `signup` from AuthContext
  const handleSignup = async () => {
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsLoading(true);
      const { success, error } = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      if (success) {
        toast({
          title: "Account created!",
          description: "Welcome to Allergy Tracker.",
        });
        router.replace("/profile-setup");
      } else {
        setErrors({ general: error || "Signup failed" });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Signup error:", error);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password is a UI placeholder (needs backend integration)
  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Password reset functionality requires backend integration.",
    });
  };

  const handleCreateTemporaryProfile = async (
    profileType: "allergic-only" | "one-allergen-mixed" | "random-signs"
  ) => {
    try {
      setIsLoading(true);
      const { success, error } = await createTemporaryTestProfile(profileType);
      if (success) {
        const profileLabel =
          profileType === "allergic-only"
            ? "Profile 1"
            : profileType === "one-allergen-mixed"
            ? "Profile 2"
            : "Profile 3";
        toast({
          title: "Temporary profile ready",
          description: `${profileLabel} fake data seeded for testing.`,
        });
        router.replace("/profile-setup");
      } else {
        setErrors({ general: error || "Failed to create temporary profile" });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.scroll}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      {mode === "landing" && (
        <View style={styles.panel}>
          <Logo size="lg" />
          <Text style={styles.caption}>
            Track your food intake and symptoms to discover potential allergy
            patterns
          </Text>
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              onPress={() => setMode("login")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("signup")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCreateTemporaryProfile("allergic-only")}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoading ? "Creating test profile..." : "Use Test Profile 1 (Only Allergic Foods)"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCreateTemporaryProfile("one-allergen-mixed")}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoading ? "Creating test profile..." : "Use Test Profile 2 (One Allergen + Many Normal Foods)"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCreateTemporaryProfile("random-signs")}
              style={styles.secondaryButton}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>
                  {isLoading ? "Creating test profile..." : "Use Test Profile 3 (Multi-Allergy Tracking)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {mode === "login" && (
        <View style={styles.panel}>
          <TouchableOpacity
            onPress={() => setMode("landing")}
            style={styles.backRow}
          >
            <Feather name="arrow-left" size={18} color={colors.muted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Logo size="md" />
          <Text style={styles.subtitle}>Welcome back!</Text>

          {errors.general ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.formBlock}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.muted}
                  value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={16}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => setMode("forgot")}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.primaryButton}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.link} onPress={() => setMode("signup")}>
              Sign Up
            </Text>
          </Text>
        </View>
      )}

      {mode === "signup" && (
        <View style={styles.panel}>
          <TouchableOpacity
            onPress={() => setMode("landing")}
            style={styles.backRow}
          >
            <Feather name="arrow-left" size={18} color={colors.muted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Logo size="md" />
          <Text style={styles.subtitle}>Create your account</Text>

          {errors.general ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.formBlock}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrap}>
              <Feather name="user" size={16} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />
            </View>
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={16}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={16} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange("confirmPassword", text)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={16}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            style={styles.primaryButton}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => setMode("login")}>
              Login
            </Text>
          </Text>
        </View>
      )}

      {mode === "forgot" && (
        <View style={styles.panel}>
          <TouchableOpacity
            onPress={() => setMode("login")}
            style={styles.backRow}
          >
            <Feather name="arrow-left" size={18} color={colors.muted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Logo size="md" />
          <Text style={styles.subtitle}>Reset your password</Text>

          <View style={styles.formBlock}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={16} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Send Reset Link</Text>
          </TouchableOpacity>
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
  danger: string;
  dangerBg: string;
}) =>
  StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  caption: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
  actionsColumn: {
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: colors.muted,
    fontSize: 12,
  },
  subtitle: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
  },
  formBlock: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 12,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  footerText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
});
