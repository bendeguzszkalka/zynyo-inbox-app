import { Ionicons } from "@expo/vector-icons";

import { Link, Stack } from "expo-router";

import { useCallback, useEffect, useState } from "react";

import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  PlatformColor,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InboxItem } from "../constants/data";

import {
  cardShadow,
  fontSizes,
  fontWeights,
  iconSizes,
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
  { label: "All Requests", value: null },

  { label: "To Sign", value: "TO_SIGN" },

  { label: "Signed", value: "SIGNED" },

  { label: "Cancelled", value: "CANCELLED" },

  { label: "Rejected", value: "REJECTED" },
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

  const [showAndroidFilterModal, setShowAndroidFilterModal] = useState(false);

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

  // ── Filter action sheet ──

  const handleFilterPress = () => {
    if (Platform.OS === "ios") {
      const options = [...FILTER_OPTIONS.map((o) => o.label), "Cancel"];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Filter Sign Requests",
        },

        (i) => {
          if (i < options.length - 1) setStatusFilter(FILTER_OPTIONS[i].value);
        },
      );
    } else {
      setShowAndroidFilterModal(true);
    }
  };

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

  const activeOption = FILTER_OPTIONS.find((o) => o.value === statusFilter);

  const filterLabel = activeOption?.label ?? "All Requests";

  // ── OS-adaptive label colours (auto-adapt through glass on iOS) ──

  const labelColor =
    Platform.OS === "ios"
      ? (PlatformColor("label") as any)
      : themeColors.settings.labelText;

  const secondaryColor =
    Platform.OS === "ios"
      ? (PlatformColor("secondaryLabel") as any)
      : themeColors.settings.valueText;

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

  const renderAndroidFilterModal = () => (
    <Modal
      visible={showAndroidFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAndroidFilterModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowAndroidFilterModal(false)}
      >
        <View
          style={[
            styles.modalContent,

            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { color: themeColors.settings.labelText },
            ]}
          >
            Filter Sign Requests
          </Text>

          {FILTER_OPTIONS.map((option) => {
            const isSelected = statusFilter === option.value;

            return (
              <Pressable
                key={option.value ?? "all"}
                style={styles.modalOption}
                onPress={() => {
                  setStatusFilter(option.value);

                  setShowAndroidFilterModal(false);
                }}
              >
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={
                    isSelected
                      ? themeColors.primary
                      : themeColors.settings.valueText
                  }
                  style={{ marginRight: spacing.medium }}
                />

                <Text
                  style={[
                    styles.modalOptionText,

                    {
                      color: themeColors.settings.labelText,

                      fontWeight: isSelected ? "bold" : "normal",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

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
                gap: spacing.medium,
              }}
            >
              <Pressable hitSlop={15} onPress={handleFilterPress}>
                {({ pressed }) => (
                  <Ionicons
                    name={statusFilter !== null ? "funnel" : "funnel-outline"}
                    size={iconSizes.medium}
                    color={themeColors.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>

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

      {Platform.OS === "android" && renderAndroidFilterModal()}
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
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: fontSizes.body,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  emptyText: { fontSize: fontSizes.heading, textAlign: "center" },

  // Android Filter Modal

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.4)",

    justifyContent: "center",

    alignItems: "center",
  },

  modalContent: {
    width: "80%",

    borderRadius: 10,

    padding: spacing.medium,

    borderWidth: 1,

    ...cardShadow,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.medium,
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.s_medium,
  },

  modalOptionText: { fontSize: 16 },
});
