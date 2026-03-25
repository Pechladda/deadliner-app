import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton } from "@/src/components";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, spacing, typography } from "@/src/theme";

export function AboutAppScreen() {
  const navigation = useSettingsNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title">{t("aboutApp")}</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <Card style={styles.card}>
          <AppText variant="sectionTitle" style={styles.centerText}>
            {t("appName")}
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            style={styles.centerText}
          >
            {t("version")}
          </AppText>
          <AppText variant="body" style={styles.description}>
            {t("appDescription")}
          </AppText>
          <AppText variant="caption" style={styles.credit}>
            {t("developedBy")}
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
    justifyContent: "space-between",
    marginBottom: spacing.xl2,
  },
  headerSpacer: { width: 36, height: 36 },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.xl2,
    paddingVertical: spacing.xl2,
    gap: spacing.m,
  },
  centerText: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing.s,
  },
  credit: {
    textAlign: "center",
    marginTop: spacing.m,
  },
});
