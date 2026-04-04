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
              address, deadlines, and reminder settings, in order to provide
              core application functionality.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">2. Purpose of data usage</AppText>
            <AppText style={styles.bodyText}>
              Your data is used solely for operating the application, displaying
              your tasks, and sending deadline reminders. We do not use your
              data for marketing or share it with third parties.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">3. Data storage</AppText>
            <AppText style={styles.bodyText}>
              Your data is securely stored using Firebase (Cloud Firestore) and
              is linked to your account to ensure data consistency across
              sessions.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">4. Data security</AppText>
            <AppText style={styles.bodyText}>
              We implement appropriate technical measures to protect your
              personal data from unauthorized access, loss, or misuse.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">
              5. User rights (PDPA compliance)
            </AppText>
            <AppText style={styles.bodyText}>
              Users have the right to access, update, or delete their personal
              data at any time through the application settings.
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="cardTitle">6. Data retention</AppText>
            <AppText style={styles.bodyText}>
              Your data will be retained only for as long as necessary to
              provide the service. Users may delete their data at any time.
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
