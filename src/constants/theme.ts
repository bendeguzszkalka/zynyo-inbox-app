import { Platform } from "react-native";

export const lightColors = {
  primary: Platform.OS === "ios" ? "#007AFF" : "#49454F",
  background: "#FFFFFF",
  border: "#CCCCCC",
  card: "#FFFFFF",
  text: "#666666",
  destructive: "#FF3B30",
  // iOS-specific system colors for settings screen
  settings: {
    background: "#F2F2F7",
    rowBackground: "#FFFFFF",
    separator: "#C6C6C8",
    headerText: "#6D6D72",
    labelText: "#000000",
    valueText: "#8E8E93",
    chevron: "#C7C7CC",
    pressed: "#E5E5EA",
  },
};

export const darkColors = {
  primary: Platform.OS === "ios" ? "#0A84FF" : "#D0BCFF",
  background: "#121212",
  border: "#333333",
  card: "#1C1C1E",
  text: "#E0E0E0",
  destructive: "#FF453A",
  // iOS-specific system colors for settings screen
  settings: {
    background: "#000000",
    rowBackground: "#1C1C1E",
    separator: "#38383A",
    headerText: "#8E8E93",
    labelText: "#FFFFFF",
    valueText: "#8E8E93",
    chevron: "#3A3A3C",
    pressed: "#2C2C2E",
  },
};

export const colors = lightColors;

export const spacing = {
  small: 4,
  xs: 8,
  s_medium: 12,
  medium: 16,
  large: 32,
  xlarge: 40,
  iconContainer: 30,
};

export const fontSizes = {
  caption: 13,
  body: 14,
  heading: 16,
  bodyLarge: 17,
};

export const fontWeights = {
  bold: "bold" as const,
};

export const iconSizes = {
  small: 20,
  s_medium: 22,
  medium: 24,
};
