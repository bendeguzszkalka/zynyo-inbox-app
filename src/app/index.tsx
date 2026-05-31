import { Ionicons } from "@expo/vector-icons";

import { Link, Stack } from "expo-router";

import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  LayoutAnimation,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InboxItem } from "../constants/data";

import {
  borderRadii,
  borderStyles,
  cardShadow,
  fontSizes,
  fontWeights,
  iconSizes,
  pillShadow,
  spacing,
} from "../constants/theme";

import { usePreferences } from "../context/PreferencesContext";

import {
  fetchIncomingSignRequests,
  getFriendlyBadgeProps,
} from "../services/zynyo";

// Enable LayoutAnimation on Android

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { label: "All Requests", value: null, icon: "albums" as const },

  { label: "To Sign", value: "TO_SIGN", icon: "pencil" as const },

  { label: "Signed", value: "SIGNED", icon: "checkmark-circle" as const },

  { label: "Cancelled", value: "CANCELLED", icon: "close-circle" as const },

  { label: "Rejected", value: "REJECTED", icon: "ban" as const },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const { preferences, themeColors, isDark } = usePreferences();

  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<InboxItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // ── Data loading ──

  const loadInbox = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);

    setError(null);

    try {
      const data = await fetchIncomingSignRequests();

      setMessages(data);
    } catch (err: any) {
      setError(
        err?.message ?? "An unexpected error occurred while loading requests.",
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    Promise.resolve().then(() => {
      if (mounted) loadInbox();
    });

    return () => {
      mounted = false;
    };
  }, [loadInbox]);

  const onRefresh = useCallback(() => loadInbox(true), [loadInbox]);

  // ── Derived state ──

  const filteredMessages = messages.filter((item) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      item.sender.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    if (!statusFilter) return matchesSearch;

    const s = item.state.toUpperCase();

    if (statusFilter === "TO_SIGN")
      return (
        matchesSearch && (s === "NOT_VALIDATED" || s === "PARTIALLY_VALIDATED")
      );

    if (statusFilter === "SIGNED")
      return matchesSearch && (s === "SIGNED" || s === "VALIDATED");

    return matchesSearch && s === statusFilter;
  });

  const verticalPadding =
    preferences.density === "Compact" ? spacing.xs : spacing.medium;

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderMessage = ({ item }: { item: InboxItem }) => {
    const badge = getFriendlyBadgeProps(item.state, themeColors.badge);

    const cleanDescription = item.description
      ? item.description.replace(/<[^>]*>/g, "").trim()
      : "";

    return (
      <Link
        href={{ pathname: "/message", params: { data: JSON.stringify(item) } }}
        asChild
      >
        <Pressable>
          {({ pressed }) => (
            <View
              style={[
                styles.messageRow,

                {
                  paddingVertical: verticalPadding,
                  borderBottomColor: themeColors.border,
                },

                pressed && {
                  backgroundColor:
                    themeColors.settings.pressed || "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <View
                style={{
                  marginTop: spacing.small,
                  marginBottom: 0,
                  marginHorizontal: spacing.xs,
                }}
              >
                <View style={styles.headerRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.senderText,
                      {
                        color: themeColors.settings.labelText,
                        flex: 1,
                        marginRight: spacing.small,
                      },
                    ]}
                  >
                    {item.sender}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: badge.background },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing.small,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      styles.messageText,
                      {
                        color: themeColors.text,
                        flex: 1,
                        marginRight: spacing.small,
                        marginBottom: 0,
                      },
                    ]}
                  >
                    {item.message}
                  </Text>

                  <Text
                    style={[
                      styles.dateText,
                      { color: themeColors.settings.valueText },
                    ]}
                  >
                    {item.formattedDate}
                  </Text>
                </View>

                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[
                    styles.descriptionText,
                    { color: themeColors.settings.valueText, height: 36 },
                  ]}
                >
                  {cleanDescription}
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Link>
    );
  };

  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={themeColors.primary}
      colors={[themeColors.primary]}
    />
  );

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterChipsContainer}
      contentContainerStyle={styles.filterChipsContent}
    >
      {FILTER_OPTIONS.map((option) => {
        const isSelected = statusFilter === option.value;

        return (
          <Pressable
            key={option.value ?? "all"}
            style={[
              styles.filterChip,
              {
                backgroundColor: isSelected
                  ? themeColors.primary
                  : themeColors.settings.background,
              },
              isSelected && pillShadow,
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setStatusFilter(option.value);
            }}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={isSelected ? "#FFFFFF" : themeColors.settings.valueText}
            />
            <Text
              style={[
                styles.filterChipText,
                {
                  color: isSelected ? "#FFFFFF" : themeColors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: themeColors.background },
          ]}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: themeColors.background },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={themeColors.destructive}
            style={{ marginBottom: spacing.medium }}
          />

          <Text style={[styles.errorText, { color: themeColors.text }]}>
            {error}
          </Text>

          <Pressable
            style={[
              styles.retryButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => loadInbox()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    const isFiltering = searchQuery.length > 0 || statusFilter !== null;

    return (
      <FlatList
        style={[styles.container, { backgroundColor: themeColors.background }]}
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        refreshControl={renderRefreshControl()}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical={true}
        ListHeaderComponent={renderFilterChips}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons
              name={isFiltering ? "search-outline" : "mail-open-outline"}
              size={64}
              color={themeColors.settings.valueText}
              style={{ marginBottom: spacing.medium }}
            />

            <Text
              style={[
                styles.emptyText,
                { color: themeColors.settings.valueText },
              ]}
            >
              {isFiltering
                ? "No requests found matching search or filter criteria"
                : "Your Zynyo inbox is clean!"}
            </Text>

            {isFiltering && (
              <Pressable
                style={[
                  styles.retryButton,

                  {
                    backgroundColor: themeColors.primary,
                    marginTop: spacing.medium,
                  },
                ]}
                onPress={() => {
                  setSearchQuery("");
                  setStatusFilter(null);
                }}
              >
                <Text style={styles.retryButtonText}>
                  Clear Search & Filters
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen
        options={{
          title: "Inbox",

          headerLargeTitle: true,

          headerSearchBarOptions: {
            placeholder: "Search inbox...",

            onChangeText: (e) => setSearchQuery(e.nativeEvent.text),

            onCancelButtonPress: () => setSearchQuery(""),

            tintColor: themeColors.primary,
          },

          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
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
            </View>
          ),
        }}
      />

      {/* 1. ROOT LEVEL: The FlatList goes here so it connects to the native header */}

      {renderContent()}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: { paddingHorizontal: spacing.medium, paddingBottom: 120 },

  // Message row

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

  senderText: { fontSize: fontSizes.heading, fontWeight: fontWeights.bold },

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

  dateText: { fontSize: fontSizes.caption },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },

  badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  // Empty / error

  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.large,
    marginTop: 100,
  },

  errorText: {
    fontSize: fontSizes.body,
    textAlign: "center",
    marginBottom: spacing.medium,
    lineHeight: 20,
  },

  retryButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.s_medium, // Slightly taller padding to match the larger radius
    borderRadius: 24,
    ...borderStyles.squircle,
  },

  retryButtonText: {
    fontSize: fontSizes.body,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  emptyText: { fontSize: fontSizes.heading, textAlign: "center" },

  // Filter Chips

  filterChipsContainer: {
    paddingVertical: spacing.medium,
  },

  filterChipsContent: {
    paddingHorizontal: spacing.medium,
    gap: spacing.small,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.xs,
    borderRadius: borderRadii.pill,
    ...borderStyles.squircle,
  },

  filterChipText: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
  },
});
