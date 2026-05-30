import { Platform } from "react-native";

export const colors = {
  primary: Platform.OS === "ios" ? "#007AFF" : "#49454F",
  background: "#fff",
  border: "#ccc",
  text: "#666",
  destructive: "#FF3B30",
  // iOS-specific system colors for settings screen
  settings: {
    background: "#F2F2F7",
    rowBackground: "#FFFFFF",
    separator: "#C6C6C8",
    headerText: "#6D6D72",
    labelText: "#000",
    valueText: "#8E8E93",
    chevron: "#C7C7CC",
    pressed: "#E5E5EA",
  },
};

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
