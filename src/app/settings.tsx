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

type SettingsItem = {
  id: string;
  label: string;
  icon: string;
  type: "link" | "toggle" | "value" | "action";
  value?: string | boolean;
  color?: string; // Marks color as optional
};

type SettingsSection = {
  title: string;
  data: SettingsItem[];
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: "Account",
    data: [
      {
        id: "profile",
        label: "Profile & Name",
        icon: "person-outline",
        type: "link",
      },
      {
        id: "aliases",
        label: "Email Aliases",
        icon: "mail-outline",
        type: "link",
      },
      {
        id: "signature",
        label: "Signature",
        icon: "create-outline",
        type: "link",
      },
    ],
  },
  {
    title: "Notifications",
    data: [
      {
        id: "push",
        label: "Push Notifications",
        icon: "notifications-outline",
        type: "toggle",
        value: true,
      },
      {
        id: "badges",
        label: "App Icon Badges",
        icon: "alert-circle-outline",
        type: "toggle",
        value: true,
      },
      {
        id: "dnd",
        label: "Do Not Disturb",
        icon: "moon-outline",
        type: "link",
      },
    ],
  },
  {
    title: "Appearance & Behavior",
    data: [
      {
        id: "theme",
        label: "Theme",
        icon: "color-palette-outline",
        type: "value",
        value: "System",
      },
      {
        id: "swipe",
        label: "Swipe Actions",
        icon: "swap-horizontal-outline",
        type: "link",
      },
      {
        id: "density",
        label: "Inbox Density",
        icon: "list-outline",
        type: "value",
        value: "Comfortable",
      },
    ],
  },
  {
    title: "About",
    data: [
      {
        id: "help",
        label: "Help & Support",
        icon: "help-circle-outline",
        type: "link",
      },
      {
        id: "version",
        label: "App Version",
        icon: "information-circle-outline",
        type: "value",
        value: "1.0.0",
      },
      {
        id: "logout",
        label: "Log Out",
        icon: "log-out-outline",
        type: "action",
        color: "#FF3B30",
      }, // iOS destructive red
    ],
  },
];

export default function SettingsScreen() {
  // Renders each individual row based on its "type"
  const renderItem = ({ item }: { item: SettingsItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        // Slight highlight when tapping a link or action
        pressed &&
          (item.type === "link" || item.type === "action") && {
            backgroundColor: "#E5E5EA",
          },
      ]}
    >
      <View style={styles.rowIconContainer}>
        {/* If the item has a specific color (like logout), use it. Otherwise use iOS Blue */}
        <Ionicons
          name={item.icon as any}
          size={22}
          color={item.color || "#007AFF"}
        />
      </View>

      <Text style={[styles.rowLabel, item.color && { color: item.color }]}>
        {item.label}
      </Text>

      <View style={styles.rowRight}>
        {item.type === "link" && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
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
    backgroundColor: "#F2F2F7", // Standard iOS grouped settings background
  },
  contentContainer: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    color: "#6D6D72",
    marginTop: 32,
    marginBottom: 8,
    marginLeft: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C6C6C8",
  },
  rowIconContainer: {
    width: 30,
    alignItems: "flex-start",
  },
  rowLabel: {
    flex: 1,
    fontSize: 17, // Native iOS body font size
    color: "#000",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontSize: 17,
    color: "#8E8E93",
  },
});
