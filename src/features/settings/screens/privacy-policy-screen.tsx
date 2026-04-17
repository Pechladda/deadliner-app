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
            <AppText variant="caption">1. {"What we store"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {"We store your name, email, deadlines, and reminder settings."}
            </AppText>
            <AppText variant="caption">2. {"Why we store it"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {"We use it only to run the app and send deadline reminders."}
            </AppText>
            <AppText variant="caption">3. {"Data storage"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {
                "Your data is securely stored using Google Firebase (Cloud Firestore) to ensure data consistency across your devices. Firebase acts as our trusted service provider under strict security standards."
              }
            </AppText>
            <AppText variant="caption">4. {"Data retention"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {
                "We retain your personal data for as long as your account is active. If you choose to delete your account, your personal data will be completely removed from our active database within 30 days."
              }
            </AppText>
            <AppText variant="caption">5. {"Data security"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {
                "We implement appropriate technical measures to protect your personal data from unauthorized access, loss, or misuse."
              }
            </AppText>
            <AppText variant="caption">
              6. {"User rights (PDPA compliance)"}
            </AppText>
            <AppText variant="caption" style={styles.bodyText}>
              {
                "You have the right to access, update, or delete your personal data at any time through the app settings. You also have the right to withdraw your consent for data processing."
              }
            </AppText>
            <AppText variant="caption">7. {"Contact us"}</AppText>
            <AppText variant="caption" style={styles.bodyText}>
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
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.normal,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  card: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    gap: spacing.s,
  },
  bodyText: {
    color: colors.textSecondary,
    marginLeft: spacing.xl, // indent to align with text after number
  },
});
