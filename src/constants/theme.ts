import { LayoutAnimation, Platform, ViewStyle } from "react-native";

// ─── Colour palettes ────────────────────────────────────────────────────────

export const lightColors = {
  primary: Platform.OS === "ios" ? "#007AFF" : "#49454F",
  background: "#FFFFFF",
  border: "#E5E5EA", // Softer border for modern light mode
  card: "#FFFFFF",
  text: "#000000",
  destructive: "#FF3B30",
  success: "#34C759",

  // iOS 26 System Fallbacks (Used if PlatformColor fails or on Android)
  settings: {
    background: "#F2F2F7", // systemGroupedBackground
    rowBackground: "#FFFFFF", // secondarySystemGroupedBackground
    separator: "rgba(60, 60, 67, 0.29)", // True Apple translucent separator
    headerText: "rgba(60, 60, 67, 0.6)", // True Apple secondaryLabel
    labelText: "#000000",
    valueText: "rgba(60, 60, 67, 0.6)",
    chevron: "rgba(60, 60, 67, 0.3)", // tertiaryLabel
    pressed: "#E5E5EA", // systemFill
  },

  ambient: { blob2: "#007AFF" },
  badge: {
    toSign: { background: "#FFF3E0", text: "#E65100" },
    signed: { background: "#E8F5E9", text: "#1B5E20" },
    cancelled: { background: "#FFEBEE", text: "#C62828" },
    failed: { background: "#ECEFF1", text: "#37474F" },
    default: { background: "#F5F5F5", text: "#666666" },
  },
};

export const darkColors = {
  primary: Platform.OS === "ios" ? "#0A84FF" : "#D0BCFF",
  background: "#000000",
  border: "#38383A",
  card: "#1C1C1E",
  text: "#FFFFFF",
  destructive: "#FF453A",
  success: "#32D74B",

  settings: {
    background: "#000000",
    rowBackground: "#1C1C1E",
    separator: "rgba(84, 84, 88, 0.6)",
    headerText: "rgba(235, 235, 245, 0.6)",
    labelText: "#FFFFFF",
    valueText: "rgba(235, 235, 245, 0.6)",
    chevron: "rgba(235, 235, 245, 0.3)",
    pressed: "#2C2C2E",
  },

  ambient: { blob2: "#0A84FF" },
  badge: {
    toSign: { background: "#3E2723", text: "#FFB74D" },
    signed: { background: "#1B3B22", text: "#81C784" },
    cancelled: { background: "#4A1A1A", text: "#E57373" },
    failed: { background: "#37474F", text: "#90A4AE" },
    default: { background: "#2C2C2C", text: "#CCCCCC" },
  },
};

export const colors = lightColors;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  small: 4,
  xs: 8,
  s_medium: 12,
  medium: 16,
  large: 32,
  xlarge: 40,

  // iOS 26 Specific Layout Metrics
  headerBottom: 8,      // Increased gap for spatial text breathing room
  sectionGap: 24,       // Standard gap between grouped list sections
  iconContainer: 32,    // Slightly larger hit-target for list icons
  rowMinHeight: 48,     // Increased from 44pt to 48pt for modern accessibility
} as const;

// ─── Border Radii & Curves ──────────────────────────────────────────────────

export const borderRadii = {
  card: 16,             // Modern standard card
  settingsCard: 24,     // The new iOS 26 massive insetGrouped radius
  pill: 9999,           // Perfect pill regardless of height
  button: 24,           // Standard button radius
} as const;

/** * Apple's proprietary mathematical curve. 
 * Spread this object into your styles to eliminate harsh corners.
 * Example: { borderRadius: borderRadii.settingsCard, ...borderStyles.squircle }
 */
export const borderStyles = {
  squircle: {
    borderCurve: "continuous",
  } as ViewStyle,
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const fontSizes = {
  caption: 13,
  body: 15,             // Bumped up slightly for readability
  heading: 17,
  bodyLarge: 17,        // Native SF Pro list label size
} as const;

export const fontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
} as const;

export const letterSpacing = {
  sfPro: -0.41,         // Apple's exact tracking value for 17pt font
  sfProSmall: -0.08,    // Tracking for caption/sub-header text
} as const;

export const iconSizes = {
  small: 20,
  s_medium: 22,
  medium: 24,
} as const;

// ─── Shared shadow tokens (Spatial Design Diffused Shadows) ─────────────

/** Soft, wide shadow mimicking spatial floating elements */
export const pillShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

/** Barely visible depth shadow for standard cards */
export const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

// ─── Animation presets ───────────────────────────────────────────────────────

export const springPressIn = {
  toValue: 0.92,        // Less drastic compression for modern bubbly feel
  tension: 400,
  friction: 12,
  useNativeDriver: true,
} as const;

export const springPressOut = {
  toValue: 1,
  tension: 300,         // Slightly snappier bounce-back
  friction: 14,
  useNativeDriver: true,
} as const;

export const layoutSpring = {
  duration: 400,
  create: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
    springDamping: 0.75,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.75,
  },
  delete: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
    springDamping: 0.75,
  },
} as const;