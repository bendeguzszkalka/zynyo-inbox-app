import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
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
import { fontSizes, iconSizes, spacing } from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";

export default function SettingsScreen() {
  const { preferences, updatePreference, themeColors } = usePreferences();

  // 2. Map over your static imported data to inject the live state
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

  // 3. Handle native alert popups for "value" types
  const handlePress = (item: SettingsItem) => {
    if (item.id === "theme") {
      Alert.alert("Select Theme", "Choose your preferred app theme.", [
        {
          text: "Light",
          onPress: () => updatePreference("theme", "Light"),
        },
        { text: "Dark", onPress: () => updatePreference("theme", "Dark") },
        {
          text: "System Default",
          onPress: () => updatePreference("theme", "System"),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (item.id === "density") {
      Alert.alert("Inbox Density", "", [
        {
          text: "Compact",
          onPress: () => updatePreference("density", "Compact"),
        },
        {
          text: "Comfortable",
          onPress: () => updatePreference("density", "Comfortable"),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const renderItem = ({ item }: { item: SettingsItem }) => {
    // Extract the inner UI so we can conditionally wrap it in a Link or Pressable
    const InnerRow = (
      <View style={[styles.row, { backgroundColor: themeColors.settings.rowBackground, borderBottomColor: themeColors.settings.separator }]}>
        <View style={styles.rowIconContainer}>
          <Ionicons
            name={item.icon as any}
            size={iconSizes.s_medium}
            color={item.color || themeColors.primary}
          />
        </View>

        <Text style={[styles.rowLabel, { color: themeColors.settings.labelText }, item.color && { color: item.color }]}>
          {item.label}
        </Text>

        <View style={styles.rowRight}>
          {item.type === "link" && (
            <Ionicons
              name="chevron-forward"
              size={iconSizes.small}
              color={themeColors.settings.chevron}
            />
          )}
          {item.type === "value" && (
            <Text style={[styles.rowValue, { color: themeColors.settings.valueText }]}>{item.value}</Text>
          )}
          {item.type === "toggle" && (
            <Switch
              value={item.value as boolean}
              onValueChange={(newValue) =>
                updatePreference(item.id as any, newValue)
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
              pressed && { backgroundColor: themeColors.settings.pressed }
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
          item.type !== "toggle" && { backgroundColor: themeColors.settings.pressed }
        }
      >
        {InnerRow}
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={[styles.sectionHeader, { color: themeColors.settings.headerText }]}>
      {section.title.toUpperCase()}
    </Text>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: true }} />
      <SectionList
        style={[styles.container, { backgroundColor: themeColors.settings.background }]}
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
  },
  contentContainer: {
    paddingBottom: spacing.xlarge,
  },
  sectionHeader: {
    fontSize: fontSizes.caption,
    marginTop: spacing.large,
    marginBottom: spacing.xs,
    marginLeft: spacing.medium,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.s_medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIconContainer: {
    width: spacing.iconContainer,
    alignItems: "flex-start",
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSizes.bodyLarge,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: fontSizes.bodyLarge,
  },
});
