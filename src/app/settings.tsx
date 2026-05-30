import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
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
  // Renders each individual row based on its "type"
  const renderItem = ({ item }: { item: SettingsItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        // Slight highlight when tapping a link or action
        pressed &&
          (item.type === "link" || item.type === "action") && {
            backgroundColor: colors.settings.pressed,
          },
      ]}
    >
      <View style={styles.rowIconContainer}>
        {/* If the item has a specific color (like logout), use it. Otherwise use iOS Blue */}
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
            // The switch visual state won't change since we're using static data,
            // but this prevents a warning
            onValueChange={() => {}}
          />
        )}
      </View>
    </Pressable>
  );

  // Renders the gray headers above each group
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{section.title.toUpperCase()}</Text>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: true }} />
      <SectionList
        style={styles.container}
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic" // Connects to large title
        stickySectionHeadersEnabled={false} // Native iOS settings headers scroll away
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.settings.background, // Standard iOS grouped settings background
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
    fontSize: fontSizes.bodyLarge, // Native iOS body font size
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
