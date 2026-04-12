import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton, PastelBackground } from "@/src/components";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, screenSharedTokens, spacing, typography } from "@/src/theme";

export function PrivacyPolicyScreen() {
  const navigation = useSettingsNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title" style={styles.screenTitle}>
            {t("privacyPolicy")}
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <AppText variant="cardTitle">
              1. {t("privacyWhatWeStoreTitle")}
            </AppText>
            <AppText style={styles.bodyText}>
              {t("privacyWhatWeStoreBody")}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">2. {t("privacyWhyTitle")}</AppText>
            <AppText style={styles.bodyText}>{t("privacyWhyBody")}</AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              3. {t("privacyDataStorageTitle")}
            </AppText>
            <AppText style={styles.bodyText}>
              {t("privacyDataStorageBody")}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              4. {t("privacyRetentionTitle")}
            </AppText>
            <AppText style={styles.bodyText}>
              {t("privacyRetentionBody")}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              5. {t("privacySecurityTitle")}
            </AppText>
            <AppText style={styles.bodyText}>
              {t("privacySecurityBody")}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">6. {t("privacyRightsTitle")}</AppText>
            <AppText style={styles.bodyText}>{t("privacyRightsBody")}</AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">7. {t("privacyContactTitle")}</AppText>
            <AppText style={styles.bodyText}>{t("privacyContactBody")}</AppText>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.m },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.xl2,
  },
  screenTitle: {
    textAlign: "left",
    color: screenSharedTokens.screenTitleColor,
    fontSize: typography.size.xl,
    lineHeight: screenSharedTokens.screenTitleLineHeight,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
  },
  content: {
    gap: spacing.xl2,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    gap: spacing.s,
  },
  bodyText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
