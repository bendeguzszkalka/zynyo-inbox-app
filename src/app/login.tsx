import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, PlatformColor, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { spacing } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const { themeColors } = usePreferences();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLogin = () => {
    if (isValidEmail) {
      login(email.trim());
    }
  };

  const isIOS = Platform.OS === "ios";
  const sysBackground = isIOS ? PlatformColor("systemGroupedBackground") : themeColors.settings.background;
  const sysCard = isIOS ? PlatformColor("secondarySystemGroupedBackground") : themeColors.settings.rowBackground;
  const sysLabel = isIOS ? PlatformColor("label") : themeColors.text;
  const sysSecondaryLabel = isIOS ? PlatformColor("secondaryLabel") : themeColors.settings.valueText;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: sysBackground }]}
      behavior={isIOS ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="document-text" size={72} color={isIOS ? PlatformColor("systemBlue") : themeColors.primary} />
          <Text style={[styles.title, { color: sysLabel }]}>Zynyo Inbox</Text>
          <Text style={[styles.subtitle, { color: sysSecondaryLabel }]}>
            Sign in to manage your document requests
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: sysCard }]}>
            <TextInput
              style={[styles.input, { color: sysLabel }]}
              placeholder="user@example.com"
              placeholderTextColor={isIOS ? PlatformColor("placeholderText") : themeColors.settings.valueText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: isIOS ? PlatformColor("systemBlue") : themeColors.primary,
                  opacity: pressed ? 0.7 : (!isValidEmail ? 0.5 : 1)
                }
              ]}
              onPress={handleLogin}
              disabled={!isValidEmail}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.large,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginTop: spacing.large,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    borderRadius: 24,
    borderCurve: "continuous",
    overflow: "hidden",
    marginBottom: spacing.xlarge,
  },
  input: {
    paddingHorizontal: spacing.medium,
    paddingVertical: 16,
    fontSize: 17,
    letterSpacing: -0.4,
  },
  buttonContainer: {
    marginTop: spacing.small,
  },
  button: {
    borderRadius: 24,
    borderCurve: "continuous",
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
});
