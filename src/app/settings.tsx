import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    SectionList,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SETTINGS_SECTIONS, SettingsItem } from "../constants/data";
import { colors, fontSizes, iconSizes, spacing } from "../constants/theme";

export default function SettingsScreen() {
  // 1. Initialize our local state
  const [prefs, setPrefs] = useState({
    push: true,
    badges: true,
    theme: "System",
    density: "Comfortable",
  });

  // 2. Map over your static imported data to inject the live state
  const dynamicSections = SETTINGS_SECTIONS.map((section) => ({
    ...section,
    data: section.data.map((item) => {
      if (item.id === "push") return { ...item, value: prefs.push };
      if (item.id === "badges") return { ...item, value: prefs.badges };
      if (item.id === "theme") return { ...item, value: prefs.theme };
      if (item.id === "density") return { ...item, value: prefs.density };
      return item;
    }),
  }));

  // 3. Handle native alert popups for "value" types
  const handlePress = (item: SettingsItem) => {
    if (item.id === "theme") {
      Alert.alert("Select Theme", "Choose your preferred app theme.", [
        {
          text: "Light",
          onPress: () => setPrefs({ ...prefs, theme: "Light" }),
        },
        { text: "Dark", onPress: () => setPrefs({ ...prefs, theme: "Dark" }) },
        {
          text: "System Default",
          onPress: () => setPrefs({ ...prefs, theme: "System" }),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (item.id === "density") {
      Alert.alert("Inbox Density", "", [
        {
          text: "Compact",
          onPress: () => setPrefs({ ...prefs, density: "Compact" }),
        },
        {
          text: "Comfortable",
          onPress: () => setPrefs({ ...prefs, density: "Comfortable" }),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const renderItem = ({ item }: { item: SettingsItem }) => {
    // Extract the inner UI so we can conditionally wrap it in a Link or Pressable
    const InnerRow = (
      <View style={styles.row}>
        <View style={styles.rowIconContainer}>
          <Ionicons
            name={item.icon as any}
            size={iconSizes.s_medium}
            color={item.color || colors.primary}
          />
        </View>

        <Text style={[styles.rowLabel, item.color && { color: item.color }]}>
          {item.label}
        </Text>

        <View style={styles.rowRight}>
          {item.type === "link" && (
            <Ionicons
              name="chevron-forward"
              size={iconSizes.small}
              color={colors.settings.chevron}
            />
          )}
          {item.type === "value" && (
            <Text style={styles.rowValue}>{item.value}</Text>
          )}
          {item.type === "toggle" && (
            <Switch
              value={item.value as boolean}
              onValueChange={(newValue) =>
                setPrefs({ ...prefs, [item.id]: newValue })
              }
            />
          )}
        </View>
      </View>
    );

    // If it's a link (and you added an href to your data.ts), use Expo Router Link
    if (item.type === "link" && (item as any).href) {
      return (
        <Link href={(item as any).href} asChild>
          <Pressable
            style={({ pressed }) =>
              pressed && { backgroundColor: colors.settings.pressed }
            }
          >
            {InnerRow}
          </Pressable>
        </Link>
      );
    }

    // Otherwise, it's an action, toggle, or value item
    return (
      <Pressable
        onPress={() => handlePress(item)}
        disabled={item.type === "toggle"} // Let the Switch handle the tap
        style={({ pressed }) =>
          pressed &&
          item.type !== "toggle" && { backgroundColor: colors.settings.pressed }
        }
      >
        {InnerRow}
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: true }} />
      <SectionList
        style={styles.container}
        sections={dynamicSections} // <-- Feed it the mapped array
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic"
        stickySectionHeadersEnabled={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.settings.background,
  },
  contentContainer: {
    paddingBottom: spacing.xlarge,
  },
  sectionHeader: {
    fontSize: fontSizes.caption,
    color: colors.settings.headerText,
    marginTop: spacing.large,
    marginBottom: spacing.xs,
    marginLeft: spacing.medium,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.settings.rowBackground,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.s_medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.settings.separator,
  },
  rowIconContainer: {
    width: spacing.iconContainer,
    alignItems: "flex-start",
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSizes.bodyLarge,
    color: colors.settings.labelText,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: fontSizes.bodyLarge,
    color: colors.settings.valueText,
  },
});
