import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton, PastelBackground } from "@/src/components";

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
            accessibilityLabel={"Go back"}
          />
          <AppText variant="section" style={styles.screenTitle}>
            {"Privacy Policy"}
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <AppText variant="subtitle">1. {"What we store"}</AppText>
            <AppText style={styles.bodyText}>
              {"We store your name, email, deadlines, and reminder settings."}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">2. {"Why we store it"}</AppText>
            <AppText style={styles.bodyText}>
              {"We use it only to run the app and send deadline reminders."}
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">3. {"Data storage"}</AppText>
            <AppText style={styles.bodyText}>
              {
                "Your data is securely stored using Google Firebase (Cloud Firestore) to ensure data consistency across your devices. Firebase acts as our trusted service provider under strict security standards."
              }
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">4. {"Data retention"}</AppText>
            <AppText style={styles.bodyText}>
              {
                "We retain your personal data for as long as your account is active. If you choose to delete your account, your personal data will be completely removed from our active database within 30 days."
              }
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">5. {"Data security"}</AppText>
            <AppText style={styles.bodyText}>
              {
                "We implement appropriate technical measures to protect your personal data from unauthorized access, loss, or misuse."
              }
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">
              6. {"User rights (PDPA compliance)"}
            </AppText>
            <AppText style={styles.bodyText}>
              {
                "You have the right to access, update, or delete your personal data at any time through the app settings. You also have the right to withdraw your consent for data processing."
              }
            </AppText>
          </Card>

          <Card style={styles.card}>
            <AppText variant="subtitle">7. {"Contact us"}</AppText>
            <AppText style={styles.bodyText}>
              {
                "If you have any questions, privacy concerns, or wish to exercise your rights, please contact us at: support@deadliner.com"
              }
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
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.xl2,
  },
  screenTitle: {
    textAlign: "left",
    color: screenSharedTokens.screenTitleColor,
    fontWeight: typography.weight.medium,
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
  },
});
