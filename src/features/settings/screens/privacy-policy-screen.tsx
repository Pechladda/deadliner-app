import { Linking, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppIcon } from "@/src/components";

import { AppText, IconButton, PastelBackground } from "@/src/components";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { colors, constants, radius, spacing, typography } from "@/src/theme";

type PolicyLink = {
  title: string;
  subtitle: string;
  url: string;
};

const POLICY_LINKS: PolicyLink[] = [
  {
    title: "Privacy Policy",
    subtitle: "How we collect and use your data",
    url: "https://www.freeprivacypolicy.com/live/b54e7494-0759-496f-911e-567c3a86a739",
  },
  {
    title: "Terms & Conditions",
    subtitle: "Rules and guidelines for using Deadliner",
    url: "https://www.freeprivacypolicy.com/live/ee2b80c6-4698-4752-8d99-d1de949bb013",
  },
  {
    title: "End User License Agreement (EULA)",
    subtitle: "Your rights and restrictions as a user",
    url: "https://www.freeprivacypolicy.com/live/98df211a-77e6-43d7-b21b-f7c67779736c",
  },
];

function PolicyLinkCard({ item }: { item: PolicyLink }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="link"
      accessibilityLabel={item.title}
    >
      <View style={styles.cardIcon}>
        <AppIcon name="document-text" size={22} color={colors.border} />
      </View>
      <View style={styles.cardBody}>
        <AppText variant="caption" style={styles.cardTitle}>
          {item.title}
        </AppText>
        <AppText variant="caption" style={styles.cardSubtitle}>
          {item.subtitle}
        </AppText>
      </View>
      <View style={styles.cardArrow}>
        <AppIcon name="open-outline" size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

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

        <AppText variant="caption" style={styles.intro}>
          {"Tap any document below to read the full policy in your browser."}
        </AppText>

        <View style={styles.list}>
          {POLICY_LINKS.map((item) => (
            <PolicyLinkCard key={item.url} item={item} />
          ))}
        </View>

        <AppText variant="caption" style={styles.footer}>
          {"Your data is stored securely via Google Firebase.\nContact us: support@deadliner.com"}
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.xl2,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontSize: typography.size.l,       // 22 — page heading
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  intro: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,      // 12 — small supporting text
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.m,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    gap: spacing.m,
  },
  cardPressed: {
    opacity: 0.7,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.m,
    backgroundColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.s,       // 16 — card title
    lineHeight: typography.lineHeight.s,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,      // 12 — secondary description
    lineHeight: 17,
  },
  cardArrow: {
    paddingLeft: spacing.xs,
  },
  footer: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,      // 12 — footer note
    textAlign: "center",
    marginTop: spacing.xxl,
    lineHeight: 18,
  },
});
