import { Platform } from "react-native";

export const colors = {
  primary: Platform.OS === "ios" ? "#007AFF" : "#49454F",
  background: "#fff",
  border: "#ccc",
  text: "#666",
};

export const spacing = {
  small: 4,
  medium: 16,
};

export const fontSizes = {
  body: 14,
  heading: 16,
};

export const fontWeights = {
  bold: "bold" as const,
};

export const iconSizes = {
  medium: 24,
};
