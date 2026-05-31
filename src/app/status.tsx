import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, PlatformColor, ScrollView, StyleSheet, Text, View } from "react-native";
import { borderRadii, fontSizes, fontWeights, spacing } from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";
import { fetchDocumentDetails, getFriendlyBadgeProps } from "../services/zynyo";

export default function StatusScreen() {
  const { themeColors } = usePreferences();
  const { documentId } = useLocalSearchParams<{ documentId: string }>();

  const [signatories, setSignatories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (documentId) {
      fetchDocumentDetails(documentId)
        .then((data) => {
          if (mounted) {
            setSignatories(data.signatories || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(err.message || "Failed to load document details");
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
      setError("No document ID provided.");
    }
    return () => {
      mounted = false;
    };
  }, [documentId]);

  const sysLabel = Platform.OS === "ios" ? (PlatformColor("label") as any) : themeColors.text;
  const sysSecondaryLabel = Platform.OS === "ios" ? (PlatformColor("secondaryLabel") as any) : themeColors.settings.valueText;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Signatories",
          headerLargeTitle: false,
          headerBackTitle: " ",
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: spacing.xlarge }} />
        ) : error ? (
          <Text style={[styles.errorText, { color: themeColors.destructive }]}>{error}</Text>
        ) : signatories.length === 0 ? (
          <Text style={[styles.emptyText, { color: sysSecondaryLabel }]}>No signatories found.</Text>
        ) : (
          signatories.map((sig, idx) => {
            const badge = getFriendlyBadgeProps(sig.state || "UNKNOWN", themeColors.badge);
            return (
              <View key={idx} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: spacing.small }}>
                    <Text numberOfLines={1} style={[styles.sigName, { color: sysLabel }]}>{sig.name}</Text>
                    <Text numberOfLines={1} style={[styles.sigEmail, { color: sysSecondaryLabel }]}>{sig.email}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.background }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>
              </View>
            );
          })
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
  errorText: {
    fontSize: fontSizes.bodyLarge,
    textAlign: "center",
    marginTop: spacing.large,
  },
  emptyText: {
    fontSize: fontSizes.bodyLarge,
    textAlign: "center",
    marginTop: spacing.large,
  },
  card: {
    borderRadius: borderRadii.settingsCard,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: spacing.s_medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.medium,
  },
  sigName: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
    marginBottom: 4,
  },
  sigEmail: {
    fontSize: fontSizes.body,
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
});
