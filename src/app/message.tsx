import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Platform, PlatformColor, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { InboxItem } from "../constants/data";
import {
  borderRadii,
  fontSizes,
  fontWeights,
  iconSizes,
  letterSpacing,
  spacing,
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";

import { getFriendlyBadgeProps } from "../services/zynyo";

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

  const badge = getFriendlyBadgeProps(item.state, themeColors.badge, item.userHasSigned, item.userRole, item.signatoryState);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Message",
          headerLargeTitle: false,
          headerBackTitle: " ",
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
          <Link href={{ pathname: "/status", params: { documentId: item.id } }} asChild>
            <Pressable>
              {({ pressed }) => (
                <View
                  style={[
                    styles.cardHeader,
                    pressed && { backgroundColor: Platform.OS === "ios" ? (PlatformColor("systemFill") as any) : themeColors.settings.pressed }
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: sysLabel }]}>Status</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={[styles.badge, { backgroundColor: badge.background }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={iconSizes.small || 16}
                      color={Platform.OS === "ios" ? (PlatformColor("tertiaryLabel") as any) : themeColors.settings.chevron}
                      style={{ marginLeft: spacing.small }}
                    />
                  </View>
                </View>
              )}
            </Pressable>
          </Link>
          <View style={[styles.separator, { backgroundColor: themeColors.border }]} />
          <View style={styles.cardContent}>
            <Text style={[styles.bodyText, { color: sysLabel }]}>
              {cleanDescription || "No description provided."}
            </Text>
          </View>
        </View>

        {item.signatoryState === "REJECTED" ? (
          <View style={[styles.openBrowserButton, { backgroundColor: themeColors.settings.pressed }]}>
            <Ionicons name="close-circle" size={iconSizes.medium || 20} color={themeColors.destructive} style={{ marginRight: spacing.small }} />
            <Text style={[styles.openBrowserButtonText, { color: themeColors.destructive }]}>You have rejected this document</Text>
          </View>
        ) : item.state === "CANCELLED" ? (
          <View style={[styles.openBrowserButton, { backgroundColor: themeColors.settings.pressed }]}>
            <Ionicons name="ban" size={iconSizes.medium || 20} color={themeColors.text} style={{ marginRight: spacing.small }} />
            <Text style={[styles.openBrowserButtonText, { color: themeColors.text }]}>This document was cancelled</Text>
          </View>
        ) : item.userHasSigned ? (
          <View style={[styles.openBrowserButton, { backgroundColor: themeColors.settings.pressed }]}>
            <Ionicons name="checkmark-circle" size={iconSizes.medium || 20} color={themeColors.success} style={{ marginRight: spacing.small }} />
            <Text style={[styles.openBrowserButtonText, { color: themeColors.success }]}>You have signed this document</Text>
          </View>
        ) : item.userRole === "RECEIVE" || item.userRole === "CC" ? (
          <Pressable
            style={({ pressed }) => [
              styles.openBrowserButton,
              { backgroundColor: themeColors.primary },
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => {
              const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "https://sandbox.zynyo.com").replace("/api/rest/v4", "");
              WebBrowser.openBrowserAsync(`${baseUrl}/sign/${item.signatoryId || item.id}`);
            }}
          >
            <Ionicons name="eye-outline" size={iconSizes.medium || 20} color="#FFFFFF" style={{ marginRight: spacing.small }} />
            <Text style={styles.openBrowserButtonText}>Open in Browser to View</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.openBrowserButton,
              { backgroundColor: themeColors.primary },
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => {
              const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "https://sandbox.zynyo.com").replace("/api/rest/v4", "");
              WebBrowser.openBrowserAsync(`${baseUrl}/sign/${item.signatoryId || item.id}`);
            }}
          >
            <Ionicons name="globe-outline" size={iconSizes.medium || 20} color="#FFFFFF" style={{ marginRight: spacing.small }} />
            <Text style={styles.openBrowserButtonText}>Open in Browser to Sign</Text>
          </Pressable>
        )}
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
  openBrowserButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: borderRadii.button,
  },
  openBrowserButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.bodyLarge,
    fontWeight: fontWeights.bold,
  },
});
