import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton } from "@/src/components";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, spacing } from "@/src/theme";

export function PrivacyPolicyScreen() {
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
          <AppText variant="title">{t("privacyPolicy")}</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <AppText variant="cardTitle">
              {t("privacyWhatWeStoreTitle")}
            </AppText>
            <AppText>{t("privacyWhatWeStoreBody")}</AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">{t("privacyWhyTitle")}</AppText>
            <AppText>{t("privacyWhyBody")}</AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">{t("privacyDeleteTitle")}</AppText>
            <AppText>{t("privacyDeleteBody")}</AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              {t("privacyNoExtraDataTitle")}
            </AppText>
            <AppText>{t("privacyNoExtraDataBody")}</AppText>
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
    justifyContent: "space-between",
    marginBottom: spacing.xl2,
  },
  headerSpacer: { width: 36, height: 36 },
  content: {
    gap: spacing.l,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceWarm,
    gap: spacing.s,
  },
});
