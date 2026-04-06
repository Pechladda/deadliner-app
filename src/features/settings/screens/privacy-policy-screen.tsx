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
          <AppText variant="title">Privacy Policy</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <AppText variant="cardTitle">1. What we collect</AppText>
            <AppText style={styles.bodyText}>
              We collect limited personal data, including your name, email
              address, tasks, deadlines, and reminder settings. We may also
              collect basic app performance and crash logs to improve
              application stability.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">2. Purpose of data usage</AppText>
            <AppText style={styles.bodyText}>
              Your data is used solely for operating the Deadliner application,
              displaying your tasks, and sending deadline reminders. We do not
              sell your personal data or share it with third parties for
              marketing purposes.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">3. Data storage</AppText>
            <AppText style={styles.bodyText}>
              Your data is securely stored using Google Firebase (Cloud
              Firestore) to ensure data consistency across your devices.
              Firebase acts as our trusted service provider under strict
              security standards.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">4. Data retention</AppText>
            <AppText style={styles.bodyText}>
              We retain your personal data for as long as your account is
              active. If you choose to delete your account, your personal data
              will be completely removed from our active database within 30
              days.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">5. Data security</AppText>
            <AppText style={styles.bodyText}>
              We implement appropriate technical measures to protect your
              personal data from unauthorized access, loss, or misuse.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              6. User rights (PDPA compliance)
            </AppText>
            <AppText style={styles.bodyText}>
              You have the right to access, update, or delete your personal data
              at any time through the app settings. You also have the right to
              withdraw your consent for data processing.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">7. Contact us</AppText>
            <AppText style={styles.bodyText}>
              If you have any questions, privacy concerns, or wish to exercise
              your rights, please contact us at: [ support@deadliner.com]
            </AppText>
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
    gap: spacing.xl2,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceWarm,
    gap: spacing.s,
  },
  bodyText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
