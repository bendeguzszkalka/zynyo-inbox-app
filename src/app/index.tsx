import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { InboxItem } from "../constants/data";
import {
  fontSizes,
  fontWeights,
  iconSizes,
  spacing,
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";
import { fetchIncomingSignRequests } from "../services/zynyo";

function getStateBadgeProps(state: string, isDark: boolean) {
  const s = state.toUpperCase();
  if (s === "NOT_VALIDATED" || s === "PARTIALLY_VALIDATED") {
    return {
      label: "To Sign",
      backgroundColor: isDark ? "#3E2723" : "#FFF3E0",
      textColor: isDark ? "#FFB74D" : "#E65100",
    };
  }
  if (s === "SIGNED" || s === "VALIDATED") {
    return {
      label: "Signed",
      backgroundColor: isDark ? "#1B3B22" : "#E8F5E9",
      textColor: isDark ? "#81C784" : "#1B5E20",
    };
  }
  if (s === "CANCELLED" || s === "REJECTED") {
    return {
      label: s === "CANCELLED" ? "Cancelled" : "Rejected",
      backgroundColor: isDark ? "#4A1A1A" : "#FFEBEE",
      textColor: isDark ? "#E57373" : "#C62828",
    };
  }
  if (s === "AUTHENTICATION_FAILED" || s === "ERROR") {
    return {
      label: "Failed",
      backgroundColor: isDark ? "#37474F" : "#ECEFF1",
      textColor: isDark ? "#90A4AE" : "#37474F",
    };
  }
  return {
    label: state,
    backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5",
    textColor: isDark ? "#CCCCCC" : "#666666",
  };
}

export default function InboxScreen() {
  const { preferences, themeColors, isDark } = usePreferences();
  const [messages, setMessages] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchIncomingSignRequests();
      setMessages(data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while loading requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Resolve in a microtask to avoid synchronous state setting during mount effect
    Promise.resolve().then(() => {
      if (isMounted) {
        loadInbox();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadInbox]);

  const onRefresh = useCallback(() => {
    loadInbox(true);
  }, [loadInbox]);

  // Determine row spacing based on selected density
  const verticalPadding = preferences.density === "Compact" ? spacing.xs : spacing.medium;

  const renderMessage = ({ item }: { item: InboxItem }) => {
    const badge = getStateBadgeProps(item.state, isDark);
    
    // Clean description of basic HTML tags
    const cleanDescription = item.description
      ? item.description.replace(/<[^>]*>/g, "").trim()
      : "";

    return (
      <View
        style={[
          styles.messageRow,
          {
            paddingVertical: verticalPadding,
            borderBottomColor: themeColors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.senderText, { color: themeColors.settings.labelText }]}>
            {item.sender}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.textColor }]}>
              {badge.label}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.messageText, { color: themeColors.text }]}>
          {item.message}
        </Text>
        
        {cleanDescription ? (
          <Text style={[styles.descriptionText, { color: themeColors.settings.valueText }]}>
            {cleanDescription}
          </Text>
        ) : null}
        
        <Text style={[styles.dateText, { color: themeColors.settings.valueText }]}>
          {item.formattedDate}
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={themeColors.destructive}
            style={{ marginBottom: spacing.medium }}
          />
          <Text style={[styles.errorText, { color: themeColors.text }]}>{error}</Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => loadInbox()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <FlatList
          style={[styles.container, { backgroundColor: themeColors.background }]}
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons
                name="mail-open-outline"
                size={64}
                color={themeColors.settings.valueText}
                style={{ marginBottom: spacing.medium }}
              />
              <Text style={[styles.emptyText, { color: themeColors.settings.valueText }]}>
                Your Zynyo inbox is clean!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          contentContainerStyle={styles.scrollContent}
        />
      );
    }

    return (
      <FlatList
        style={[styles.container, { backgroundColor: themeColors.background }]}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Inbox",
          headerLargeTitle: true,
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable hitSlop={15}>
                {({ pressed }) => (
                  <Ionicons
                    name={
                      Platform.OS === "ios" ? "settings-outline" : "settings"
                    }
                    size={iconSizes.medium}
                    color={themeColors.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      {renderContent()}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.medium, paddingBottom: spacing.large },
  messageRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.s_medium,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.small,
  },
  senderText: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
  },
  messageText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: "600",
    marginBottom: spacing.small,
  },
  descriptionText: {
    fontSize: fontSizes.body,
    marginBottom: spacing.small,
    lineHeight: 18,
  },
  dateText: {
    fontSize: fontSizes.caption,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
  },
  errorText: {
    fontSize: fontSizes.body,
    textAlign: "center",
    marginBottom: spacing.medium,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: fontSizes.body,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emptyText: {
    fontSize: fontSizes.heading,
    textAlign: "center",
  },
});

