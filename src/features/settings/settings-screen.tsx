import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, IconButton } from "@/src/components";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, spacing } from "@/src/theme";

type SettingsRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function SettingsRow({ label, icon, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <AppText>{label}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useSettingsNavigation();

  const onPressSetting = (label: string) => {
    Alert.alert(label, "Coming soon");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          />
          <AppText variant="title">Settings</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <SettingsRow
            label="Profile"
            icon="person-outline"
            onPress={() => onPressSetting("Profile")}
          />
          <SettingsRow
            label="Notifications"
            icon="notifications-outline"
            onPress={() => onPressSetting("Notifications")}
          />
          <SettingsRow
            label="About App"
            icon="help-circle-outline"
            onPress={() => onPressSetting("About App")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.s },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 36, height: 36 },
  section: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
});
