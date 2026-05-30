import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: true }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
