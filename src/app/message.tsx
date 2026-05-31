import { Stack, useLocalSearchParams } from "expo-router";
import { Platform, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import { InboxItem } from "../constants/data";
import {
  borderRadii,
  fontSizes,
  fontWeights,
  letterSpacing,
  spacing,
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";

export default function MessageScreen() {
  const { themeColors } = usePreferences();
  const { data } = useLocalSearchParams();

  let item: InboxItem | null = null;
  try {
    if (typeof data === "string") {
      item = JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse message data", e);
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: themeColors.text }}>Message not found.</Text>
      </View>
    );
  }

  const sysLabel = Platform.OS === "ios" ? (PlatformColor("label") as any) : themeColors.text;
  const sysSecondaryLabel = Platform.OS === "ios" ? (PlatformColor("secondaryLabel") as any) : themeColors.settings.valueText;

  // Clean HTML from description for full display
  const cleanDescription = item.description
    ? item.description.replace(/<[^>]*>/g, "").trim()
    : "";

  return (
    <>
      <Stack.Screen
        options={{
          title: "Message Details",
          headerLargeTitle: false,
          headerBackTitleVisible: false,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: sysLabel }]}>{item.message}</Text>
          <Text style={[styles.sender, { color: sysSecondaryLabel }]}>From: {item.sender}</Text>
          <Text style={[styles.date, { color: sysSecondaryLabel }]}>{item.formattedDate}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: sysLabel }]}>Status</Text>
            <View style={[styles.badge, { backgroundColor: themeColors.primary + "33" }]}>
              <Text style={[styles.badgeText, { color: themeColors.primary }]}>{item.state.replace(/_/g, " ")}</Text>
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />
          <View style={styles.cardContent}>
            <Text style={[styles.bodyText, { color: sysLabel }]}>
              {cleanDescription || "No description provided."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.medium,
    paddingBottom: spacing.xlarge,
  },
  header: {
    marginBottom: spacing.large,
    paddingHorizontal: spacing.small,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.small,
    letterSpacing: letterSpacing.sfPro,
  },
  sender: {
    fontSize: fontSizes.bodyLarge,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSizes.body,
  },
  card: {
    borderRadius: borderRadii.settingsCard,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.medium,
  },
  cardTitle: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  cardContent: {
    padding: spacing.medium,
    minHeight: 100,
  },
  bodyText: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: 24,
  },
});
