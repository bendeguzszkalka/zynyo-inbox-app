import { DefaultTheme, DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { PreferencesProvider, usePreferences } from "../context/PreferencesContext";

function RootLayoutNav() {
  const { isDark, themeColors } = usePreferences();

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

  return (
    <ThemeProvider value={customTheme}>
      <Stack>
        <Stack.Screen name="Index" options={{ title: "Inbox" }} />
        <Stack.Screen name="Settings" options={{ title: "Settings" }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <RootLayoutNav />
    </PreferencesProvider>
  );
}
