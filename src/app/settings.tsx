import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import {
  Alert,
  Platform,
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SETTINGS_SECTIONS, SettingsItem } from "../constants/data";
import {
  borderRadii,
  fontSizes,
  fontWeights,
  iconSizes,
  letterSpacing,
  spacing
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";

export default function SettingsScreen() {
  const { preferences, updatePreference, themeColors } = usePreferences();

  const dynamicSections = SETTINGS_SECTIONS.map((section) => ({
    ...section,
    data: section.data.map((item) => {
      if (item.id === "push") return { ...item, value: preferences.push };
      if (item.id === "badges") return { ...item, value: preferences.badges };
      if (item.id === "theme") return { ...item, value: preferences.theme };
      if (item.id === "density") return { ...item, value: preferences.density };
      return item;
    }),
  }));

  const handlePress = (item: SettingsItem) => {
    if (item.id === "theme") {
      Alert.alert("Select Theme", "Choose your preferred app theme.", [
        { text: "Light", onPress: () => updatePreference("theme", "Light") },
        { text: "Dark", onPress: () => updatePreference("theme", "Dark") },
        { text: "System Default", onPress: () => updatePreference("theme", "System") },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (item.id === "density") {
      Alert.alert("Inbox Density", "", [
        { text: "Compact", onPress: () => updatePreference("density", "Compact") },
        { text: "Comfortable", onPress: () => updatePreference("density", "Comfortable") },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  // ── 100% Native OS Semantic Colors ──
  const sysBackground = Platform.OS === "ios" ? PlatformColor("systemGroupedBackground") : themeColors.settings.background;
  const sysCardBackground = Platform.OS === "ios" ? PlatformColor("secondarySystemGroupedBackground") : themeColors.settings.rowBackground;
  const sysSeparator = Platform.OS === "ios" ? PlatformColor("separator") : themeColors.settings.separator;
  const sysLabel = Platform.OS === "ios" ? PlatformColor("label") : themeColors.settings.labelText;
  const sysSecondaryLabel = Platform.OS === "ios" ? PlatformColor("secondaryLabel") : themeColors.settings.valueText;
  const sysTertiaryLabel = Platform.OS === "ios" ? PlatformColor("tertiaryLabel") : themeColors.settings.chevron;

  const renderRow = (item: SettingsItem) => {
    const isToggle = item.type === "toggle";
    const isLink = item.type === "link" && (item as any).href;

    const innerRow = (
      <View style={styles.row}>
        <Text
          style={[
            styles.rowLabel,
            { color: sysLabel },
            item.color ? { color: item.color } : undefined,
          ]}
        >
          {item.label}
        </Text>

        <View style={styles.rowRight}>
          {item.type === "value" && (
            <Text style={[styles.rowValue, { color: sysSecondaryLabel }]}>
              {item.value as string}
            </Text>
          )}
          {item.type === "link" && (
            <Ionicons
              name="chevron-forward"
              size={iconSizes.small}
              color={sysTertiaryLabel}
            />
          )}
          {isToggle && (
            <Switch
              value={item.value as boolean}
              onValueChange={(v) => updatePreference(item.id as any, v)}
              trackColor={Platform.OS === "ios" ? { true: themeColors.success } : undefined}
            />
          )}
        </View>
      </View>
    );

    const pressableStyle = ({ pressed }: { pressed: boolean }) =>
      pressed && !isToggle
        ? { backgroundColor: Platform.OS === "ios" ? PlatformColor("systemFill") : themeColors.settings.pressed }
        : undefined;

    if (isLink) {
      return (
        <Link href={(item as any).href} asChild key={item.id}>
          <Pressable style={pressableStyle}>{innerRow}</Pressable>
        </Link>
      );
    }

    return (
      <Pressable
        key={item.id}
        onPress={isToggle ? undefined : () => handlePress(item)}
        disabled={isToggle}
        style={pressableStyle}
      >
        {innerRow}
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerLargeTitle: true,
          headerLeft: undefined,
          headerRight: () => null,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: sysBackground }]}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic"
      >
        {dynamicSections.map((section) => (
          <View key={section.title} style={styles.sectionContainer}>
            <Text style={[styles.sectionHeader, { color: sysSecondaryLabel }]}>
              {section.title}
            </Text>

            <View
              style={[
                styles.sectionCard,
                { backgroundColor: sysCardBackground }
              ]}
            >
              {section.data.map((item, index) => (
                <View key={item.id}>
                  {renderRow(item)}
                  {index < section.data.length - 1 && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: sysSeparator },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    paddingBottom: spacing.xlarge,
    paddingTop: spacing.medium
  },

  sectionContainer: { marginBottom: spacing.sectionGap },
  sectionHeader: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    marginBottom: spacing.headerBottom,
    marginLeft: spacing.large,
    textTransform: "capitalize",
  },
  sectionCard: {
    marginHorizontal: spacing.medium,
    borderRadius: borderRadii.settingsCard,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
    minHeight: spacing.rowMinHeight,
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSizes.bodyLarge,
    letterSpacing: letterSpacing.sfPro,
  },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rowValue: {
    fontSize: fontSizes.bodyLarge,
    marginRight: spacing.headerBottom // recycling the 6px gap safely
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.medium,
  },
});