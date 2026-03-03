import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, IconButton } from "@/src/components";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, radius, spacing } from "@/src/theme";

export function AboutAppScreen() {
  const navigation = useSettingsNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          />
          <AppText variant="title">About App</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <AppText variant="heading" style={styles.centerText}>
            Deadliner
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            style={styles.centerText}
          >
            Version 1.0.0
          </AppText>
          <AppText variant="body" style={styles.description}>
            Deadliner helps students visualize urgency and never miss important
            deadlines.
          </AppText>
          <AppText variant="caption" style={styles.credit}>
            Developed by Maymae
          </AppText>
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
    marginBottom: spacing.xl,
  },
  headerSpacer: { width: 36, height: 36 },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.m,
  },
  centerText: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.s,
  },
  credit: {
    textAlign: "center",
    marginTop: spacing.m,
  },
});
