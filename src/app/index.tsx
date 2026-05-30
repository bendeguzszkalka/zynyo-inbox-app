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

const INBOX_DATA = [
  {
    id: "1",
    sender: "GitHub",
    message: "Dependabot alert: update your packages.",
  },
  {
    id: "2",
    sender: "Hackathon Organizers",
    message: "Pizza has arrived in the lobby!",
  },
  {
    id: "3",
    sender: "Zynyo",
    message: "Please sign the document.",
  },
  {
    id: "4",
    sender: "Vercel",
    message: "Your deployment 'zynyo-inbox-app-xyz' is ready.",
  },
  {
    id: "5",
    sender: "Slack",
    message: "You have a new message from John Doe.",
  },
  { id: "6", sender: "Jira", message: "TICKET-123 has been updated." },
  {
    id: "7",
    sender: "Figma",
    message: "Jane shared a new design file with you.",
  },
  {
    id: "8",
    sender: "Google Calendar",
    message: "Reminder: Team Standup in 15 minutes.",
  },
  {
    id: "9",
    sender: "Notion",
    message: "A page was shared with you: 'Project Phoenix Specs'.",
  },
  {
    id: "10",
    sender: "Linear",
    message: "New issue assigned to you: 'Fix login button'.",
  },
  { id: "11", sender: "Sentry", message: "New error detected in production." },
  {
    id: "12",
    sender: "Stripe",
    message: "Your monthly payout has been processed.",
  },
  {
    id: "13",
    sender: "Miro",
    message: "You were mentioned on the 'Q4 Planning' board.",
  },
  {
    id: "14",
    sender: "Zoom",
    message: "Your meeting '1:1 with Sarah' is starting now.",
  },
  {
    id: "15",
    sender: "AWS",
    message:
      "Billing Alert: Your estimated charges have exceeded the threshold.",
  },
  {
    id: "16",
    sender: "DocuSign",
    message: "Completed: Please review the signed document.",
  },
  {
    id: "17",
    sender: "Expo",
    message: "A new build for your project is available.",
  },
  {
    id: "18",
    sender: "OpenAI",
    message: "Your API usage for the month is approaching its limit.",
  },
];

export default function InboxScreen() {
  // FlatList requires a "renderItem" function to know what UI to build
  const renderMessage = ({ item }: { item: (typeof INBOX_DATA)[0] }) => (
    <View style={styles.messageRow}>
      <Text style={styles.senderText}>{item.sender}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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
                    size={24}
                    // Use native iOS blue or standard Android dark gray
                    color={Platform.OS === "ios" ? "#007AFF" : "#49454F"}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <FlatList
        data={INBOX_DATA} // 1. Pass in your array
        keyExtractor={(item) => item.id} // 2. Tell it how to find the unique ID
        renderItem={renderMessage} // 3. Pass in your UI function
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic" // Recommended for iOS Large Titles inside FlatLists
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingHorizontal: 16 },
  messageRow: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  senderText: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  messageText: { fontSize: 14, color: "#666" },
});
