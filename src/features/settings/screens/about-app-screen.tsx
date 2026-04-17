import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton, PastelBackground } from "@/src/components";
import { APP_VERSION } from "@/src/core/config";

import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, screenSharedTokens, spacing, typography } from "@/src/theme";

export function AboutAppScreen() {
  const navigation = useSettingsNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={"Go back"}
          />
          <AppText variant="section" style={styles.screenTitle}>
            {"About App"}
          </AppText>
        </View>

        <Card style={styles.card}>
          <AppText variant="body" style={styles.centerText}>
            {"Deadliner"}
          </AppText>
          <AppText
            variant="caption"
            color="textSecondary"
            style={styles.centerText}
          >
            {`Version ${APP_VERSION}`}
          </AppText>
          <AppText variant="caption" style={styles.description}>
            {
              "Deadliner helps students visualize urgency and never miss important deadlines."
            }
          </AppText>
          <AppText variant="caption" style={styles.credit}>
            {"Developed by Maymae"}
          </AppText>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.m },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  screenTitle: {
    textAlign: "left",
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
    fontSize: typography.size.m,
    lineHeight: typography.lineHeight.normal,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: screenSharedTokens.contentCompactMaxWidth,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    gap: spacing.s,
  },
  centerText: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginTop: spacing.s,
  },
  credit: {
    textAlign: "center",
    marginTop: spacing.m,
  },
});
