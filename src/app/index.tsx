import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  PlatformColor,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InboxItem } from "../constants/data";
import {
  borderRadii,
  cardShadow,
  fontSizes,
  fontWeights,
  iconSizes,
  layoutSpring,
  pillShadow,
  spacing,
  springPressIn,
  springPressOut,
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";
import { fetchIncomingSignRequests } from "../services/zynyo";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Liquid Glass — crash-safe dynamic require ───────────────────────────────
let LiquidGlassView: any = View;
let LiquidGlassContainerView: any = View;
let isLiquidGlassSupported = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const LiquidGlass = require("@callstack/liquid-glass");
  if (LiquidGlass) {
    LiquidGlassView = LiquidGlass.LiquidGlassView || View;
    LiquidGlassContainerView = LiquidGlass.LiquidGlassContainerView || View;
    isLiquidGlassSupported = !!LiquidGlass.isLiquidGlassSupported;
  }
} catch {
  // Falls back to standard React Native Views silently
}

// Animated wrapper — typed as any so glass-specific props pass through without TS errors
const AnimatedLiquidGlassView: any = isLiquidGlassSupported
  ? Animated.createAnimatedComponent(LiquidGlassView)
  : Animated.createAnimatedComponent(View);

// ─── Constants ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { label: "All Requests", value: null },
  { label: "To Sign", value: "TO_SIGN" },
  { label: "Signed", value: "SIGNED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Rejected", value: "REJECTED" },
];

/** Gap between the filter and search pills — must match LiquidGlassContainerView spacing prop */
const PILL_GAP = 12;

// ─── Badge helper ─────────────────────────────────────────────────────────────

function getStateBadgeProps(
  state: string,
  badgeColors: {
    toSign: { background: string; text: string };
    signed: { background: string; text: string };
    cancelled: { background: string; text: string };
    failed: { background: string; text: string };
    default: { background: string; text: string };
  }
) {
  const s = state.toUpperCase();
  if (s === "NOT_VALIDATED" || s === "PARTIALLY_VALIDATED") {
    return { label: "To Sign", ...badgeColors.toSign };
  }
  if (s === "SIGNED" || s === "VALIDATED") {
    return { label: "Signed", ...badgeColors.signed };
  }
  if (s === "CANCELLED") {
    return { label: "Cancelled", ...badgeColors.cancelled };
  }
  if (s === "REJECTED") {
    return { label: "Rejected", ...badgeColors.cancelled };
  }
  if (s === "AUTHENTICATION_FAILED" || s === "ERROR") {
    return { label: "Failed", ...badgeColors.failed };
  }
  return { label: state, ...badgeColors.default };
}

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // ── Animated values for press-spring feedback (useNativeDriver → UI thread) ──
  const filterScale = useRef(new Animated.Value(1)).current;
  const searchScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) =>
    Animated.spring(anim, springPressIn).start();
  const pressOut = (anim: Animated.Value) =>
    Animated.spring(anim, springPressOut).start();

  // ── Expand / collapse with layout spring ──
  const expandSearch = () => {
    LayoutAnimation.configureNext(layoutSpring);
    setIsSearchExpanded(true);
  };

  const collapseSearch = () => {
    LayoutAnimation.configureNext(layoutSpring);
    setSearchQuery("");
    setIsSearchExpanded(false);
  };

  // ── Data loading ──
  const loadInbox = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await fetchIncomingSignRequests();
      setMessages(data);
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred while loading requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => { if (mounted) loadInbox(); });
    return () => { mounted = false; };
  }, [loadInbox]);

  const onRefresh = useCallback(() => loadInbox(true), [loadInbox]);

  // ── Filter action sheet ──
  const handleFilterPress = () => {
    if (Platform.OS === "ios") {
      const options = [...FILTER_OPTIONS.map((o) => o.label), "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: options.length - 1, title: "Filter Sign Requests" },
        (i) => { if (i < options.length - 1) setStatusFilter(FILTER_OPTIONS[i].value); }
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
      return matchesSearch && (s === "NOT_VALIDATED" || s === "PARTIALLY_VALIDATED");
    if (statusFilter === "SIGNED")
      return matchesSearch && (s === "SIGNED" || s === "VALIDATED");
    return matchesSearch && s === statusFilter;
  });

  const verticalPadding =
    preferences.density === "Compact" ? spacing.xs : spacing.medium;

  const activeOption = FILTER_OPTIONS.find((o) => o.value === statusFilter);
  const filterLabel = activeOption?.label ?? "All Requests";

  // ── OS-adaptive label colours (auto-adapt through glass on iOS) ──
  const labelColor = Platform.OS === "ios"
    ? (PlatformColor("label") as any)
    : themeColors.settings.labelText;
  const secondaryColor = Platform.OS === "ios"
    ? (PlatformColor("secondaryLabel") as any)
    : themeColors.settings.valueText;

  // ── Glass fallback styles ──
  const glassCardFallback = !isLiquidGlassSupported
    ? {
      backgroundColor: themeColors.card,
      borderColor: themeColors.border,
      borderWidth: StyleSheet.hairlineWidth,
    }
    : undefined;

  // ─── Render helpers ────────────────────────────────────────────────────────

  const renderMessage = ({ item }: { item: InboxItem }) => {
    const badge = getStateBadgeProps(item.state, themeColors.badge);
    const cleanDescription = item.description
      ? item.description.replace(/<[^>]*>/g, "").trim()
      : "";

    return (
      <Link href={{ pathname: "/message", params: { data: JSON.stringify(item) } }} asChild>
        <Pressable>
          {({ pressed }) => (
            <View
              style={[
                styles.messageRow,
                { paddingVertical: verticalPadding, borderBottomColor: themeColors.border },
                pressed && { backgroundColor: themeColors.settings.pressed || "rgba(0,0,0,0.05)" }
              ]}
            >
              <View style={{ marginTop: spacing.small, marginBottom: 0, marginHorizontal: spacing.xs }}>
                <View style={styles.headerRow}>
                  <Text numberOfLines={1} style={[styles.senderText, { color: themeColors.settings.labelText, flex: 1, marginRight: spacing.small }]}>
                    {item.sender}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: badge.background }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.small }}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.messageText, { color: themeColors.text, flex: 1, marginRight: spacing.small, marginBottom: 0 }]}>
                    {item.message}
                  </Text>
                  <Text style={[styles.dateText, { color: themeColors.settings.valueText }]}>
                    {item.formattedDate}
                  </Text>
                </View>

                <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.descriptionText, { color: themeColors.settings.valueText, height: 36 }]}>
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

    const isFiltering = searchQuery.length > 0 || statusFilter !== null;

    if (filteredMessages.length === 0) {
      return (
        <FlatList
          style={[styles.container, { backgroundColor: themeColors.background }]}
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons
                name={isFiltering ? "search-outline" : "mail-open-outline"}
                size={64}
                color={themeColors.settings.valueText}
                style={{ marginBottom: spacing.medium }}
              />
              <Text style={[styles.emptyText, { color: themeColors.settings.valueText }]}>
                {isFiltering
                  ? "No requests found matching search or filter criteria"
                  : "Your Zynyo inbox is clean!"}
              </Text>
              {isFiltering && (
                <Pressable
                  style={[
                    styles.retryButton,
                    { backgroundColor: themeColors.primary, marginTop: spacing.medium },
                  ]}
                  onPress={() => { setSearchQuery(""); setStatusFilter(null); }}
                >
                  <Text style={styles.retryButtonText}>Clear Search & Filters</Text>
                </Pressable>
              )}
            </View>
          }
          refreshControl={renderRefreshControl()}
          contentContainerStyle={styles.scrollContent}
        />
      );
    }

    return (
      <FlatList
        style={[styles.container, { backgroundColor: themeColors.background }]}
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        refreshControl={renderRefreshControl()}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
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
      <Pressable style={styles.modalOverlay} onPress={() => setShowAndroidFilterModal(false)}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.card, borderColor: themeColors.border },
          ]}
        >
          <Text style={[styles.modalTitle, { color: themeColors.settings.labelText }]}>
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
                  color={isSelected ? themeColors.primary : themeColors.settings.valueText}
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
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable hitSlop={15}>
                {({ pressed }) => (
                  <Ionicons
                    name={Platform.OS === "ios" ? "settings-outline" : "settings"}
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

      {/* 1. ROOT LEVEL: The FlatList goes here so it connects to the native header */}
      {renderContent()}

      {/* 2. OVERLAY: We float the toolbar on top using absoluteFill and box-none */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={StyleSheet.absoluteFill} // <-- Stretches over the whole screen invisibly
        pointerEvents="box-none" // <-- MAGIC: Lets users tap through the invisible parts to scroll the list!
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <LiquidGlassContainerView
          spacing={PILL_GAP}
          style={[
            styles.bottomBarContainer,
            {
              bottom: insets.bottom + 8,
              left: insets.left + 20,
              right: insets.right + 20,
            },
          ]}
        >
          {isSearchExpanded ? (
            /* ── Expanded search pill ── */
            <LiquidGlassView
              style={[styles.searchExpanded, glassCardFallback]}
              effect="regular"
              colorScheme="system"
            >
              <View style={styles.searchInner}>
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={secondaryColor}
                  style={{ marginRight: spacing.small }}
                />
                <TextInput
                  style={[styles.searchInput, { color: labelColor }]}
                  placeholder="Search inbox..."
                  placeholderTextColor={secondaryColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  autoFocus
                />
                <Pressable onPress={collapseSearch} hitSlop={10} style={{ paddingLeft: spacing.small }}>
                  <Ionicons name="close-circle" size={18} color={secondaryColor} />
                </Pressable>
              </View>
            </LiquidGlassView>
          ) : (
            /* ── Collapsed pills ── */
            <>
              {/* Filter */}
              <Animated.View
                style={[
                  styles.filterOuter,
                  { transform: [{ scale: filterScale }] },
                ]}
              >
                <AnimatedLiquidGlassView
                  style={[
                    statusFilter === null ? styles.pillCircle : styles.pillWide,
                    glassCardFallback,
                    !isLiquidGlassSupported && statusFilter !== null
                      ? { borderColor: themeColors.primary }
                      : undefined,
                  ]}
                  effect="regular"
                  interactive={isLiquidGlassSupported}
                  colorScheme="system"
                  tintColor={
                    isLiquidGlassSupported && statusFilter !== null
                      ? themeColors.primary + "33"
                      : undefined
                  }
                >
                  <Pressable
                    style={statusFilter === null ? styles.circleInner : styles.pillInner}
                    onPress={handleFilterPress}
                    onPressIn={() => pressIn(filterScale)}
                    onPressOut={() => pressOut(filterScale)}
                    hitSlop={15}
                  >
                    <Ionicons
                      name="funnel-outline"
                      size={statusFilter === null ? 18 : 16}
                      color={statusFilter !== null ? themeColors.primary : labelColor}
                      style={statusFilter !== null ? { marginRight: spacing.small } : undefined}
                    />
                    {statusFilter !== null && (
                      <Text
                        numberOfLines={1}
                        style={[styles.pillLabel, { color: themeColors.primary }]}
                      >
                        {filterLabel}
                      </Text>
                    )}
                  </Pressable>
                </AnimatedLiquidGlassView>
              </Animated.View>

              {/* Search */}
              <Animated.View style={{ transform: [{ scale: searchScale }] }}>
                <AnimatedLiquidGlassView
                  style={[styles.pillCircle, glassCardFallback]}
                  effect="regular"
                  interactive={isLiquidGlassSupported}
                  colorScheme="system"
                >
                  <Pressable
                    style={styles.circleInner}
                    onPress={expandSearch}
                    onPressIn={() => pressIn(searchScale)}
                    onPressOut={() => pressOut(searchScale)}
                    hitSlop={15}
                  >
                    <Ionicons name="search-outline" size={18} color={labelColor} />
                  </Pressable>
                </AnimatedLiquidGlassView>
              </Animated.View>
            </>
          )}
        </LiquidGlassContainerView>
      </KeyboardAvoidingView>

      {Platform.OS === "android" && renderAndroidFilterModal()}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.medium, paddingBottom: 88 },

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
  messageText: { fontSize: fontSizes.bodyLarge, fontWeight: "600", marginBottom: spacing.small },
  descriptionText: { fontSize: fontSizes.body, marginBottom: spacing.small, lineHeight: 18 },
  dateText: { fontSize: fontSizes.caption },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  // Empty / error
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.large },
  errorText: { fontSize: fontSizes.body, textAlign: "center", marginBottom: spacing.medium, lineHeight: 20 },
  retryButton: { paddingHorizontal: spacing.medium, paddingVertical: spacing.xs, borderRadius: 8 },
  retryButtonText: { fontSize: fontSizes.body, fontWeight: "bold", color: "#FFFFFF" },
  emptyText: { fontSize: fontSizes.heading, textAlign: "center" },

  // ── Floating toolbar ──
  bottomBarContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // bottom / left / right are injected inline from safe-area insets
  },

  // Outer Animated.View for the filter pill — carries the gap
  filterOuter: { marginRight: PILL_GAP },

  // Glass pill shapes — overflow:hidden clips glass material to the border radius
  pillCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadii.pill,
    overflow: "hidden",
    ...pillShadow,
  },
  pillWide: {
    height: 48,
    borderRadius: borderRadii.pill,
    overflow: "hidden",
    ...pillShadow,
  },

  // Inner layout containers (no touch handling — Pressable owns that)
  circleInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pillInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: spacing.medium,
  },
  pillLabel: { fontSize: fontSizes.body, fontWeight: "600" },

  // Expanded search bar
  searchExpanded: {
    flex: 1,
    height: 48,
    borderRadius: borderRadii.pill,
    overflow: "hidden",
    ...pillShadow,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: spacing.medium,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: fontSizes.body,
    paddingVertical: 0,
  },

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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: spacing.medium },
  modalOption: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.s_medium },
  modalOptionText: { fontSize: 16 },
});
