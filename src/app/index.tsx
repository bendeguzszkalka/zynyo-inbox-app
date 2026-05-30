import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { INBOX_DATA } from "../constants/data";
import {
  fontSizes,
  fontWeights,
  iconSizes,
  spacing,
} from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";

export default function InboxScreen() {
  const { preferences, themeColors } = usePreferences();

  // Determine row spacing based on selected density
  const verticalPadding = preferences.density === "Compact" ? spacing.xs : spacing.medium;

  // FlatList requires a "renderItem" function to know what UI to build
  const renderMessage = ({ item }: { item: (typeof INBOX_DATA)[0] }) => (
    <View style={[styles.messageRow, { paddingVertical: verticalPadding, borderBottomColor: themeColors.border }]}>
      <Text style={[styles.senderText, { color: themeColors.settings.labelText }]}>{item.sender}</Text>
      <Text style={[styles.messageText, { color: themeColors.text }]}>{item.message}</Text>
    </View>
  );

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
                    // Dynamically choose the native-looking icon based on the OS
                    name={
                      Platform.OS === "ios" ? "settings-outline" : "settings"
                    }
                    size={iconSizes.medium}
                    // Use dynamic primary color
                    color={themeColors.primary}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <FlatList
        style={[styles.container, { backgroundColor: themeColors.background }]}
        data={INBOX_DATA} // 1. Pass in your array
        keyExtractor={(item) => item.id} // 2. Tell it how to find the unique ID
        renderItem={renderMessage} // 3. Pass in your UI function
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic" // Recommended for iOS Large Titles inside FlatLists
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.medium },
  messageRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  senderText: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.small,
  },
  messageText: { fontSize: fontSizes.body },
});
