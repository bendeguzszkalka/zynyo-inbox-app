import { DefaultTheme, DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { PreferencesProvider, usePreferences } from "../context/PreferencesContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { isDark, themeColors } = usePreferences();
  const { userEmail } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  // Create custom React Navigation theme matching our themeColors
  const customTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: themeColors.primary,
      background: themeColors.background,
      card: themeColors.card, // Navigation bar background
      text: themeColors.settings.labelText, // Header title text color
      border: themeColors.settings.separator, // Navigation bar border
      notification: themeColors.destructive,
    },
  };

  useEffect(() => {
    const inAuthGroup = segments[0] === "login";

    if (!userEmail && !inAuthGroup) {
      // Clear the stack before navigating to login
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/login");
    } else if (userEmail && inAuthGroup) {
      // Clear the stack before navigating to inbox
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/");
    }
  }, [userEmail, segments]);

  return (
    <ThemeProvider value={customTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Inbox" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: "fullScreenModal" }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <RootLayoutNav />
      </PreferencesProvider>
    </AuthProvider>
  );
}
