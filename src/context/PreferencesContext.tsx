import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../constants/theme";

export interface Preferences {
  push: boolean;
  badges: boolean;
  theme: "Light" | "Dark" | "System";
  density: "Comfortable" | "Compact";
}

export interface PreferencesContextProps {
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  isDark: boolean;
  themeColors: typeof lightColors;
}

const DEFAULT_PREFERENCES: Preferences = {
  push: true,
  badges: true,
  theme: "System",
  density: "Comfortable",
};

const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const systemColorScheme = useColorScheme();

  const isDark = preferences.theme === "System"
    ? systemColorScheme === "dark"
    : preferences.theme === "Dark";

  const themeColors = isDark ? darkColors : lightColors;

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        isDark,
        themeColors,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
