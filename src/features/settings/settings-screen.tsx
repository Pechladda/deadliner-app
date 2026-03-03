import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, IconButton } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { useLanguage } from "@/src/providers/language-provider";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, spacing } from "@/src/theme";

type SettingsRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function SettingsRow({ label, icon, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <AppText>{label}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useSettingsNavigation();
  const { language, setAppLanguage } = useLanguage();
  const [pendingLanguage, setPendingLanguage] = useState<"en" | "th" | null>(
    null,
  );
  const logout = useAuthStore((state) => state.logout);
  const notificationsEnabled = useDeadlineStore(
    (state) => state.notificationsEnabled,
  );
  const hasNotificationPermission = useDeadlineStore(
    (state) => state.hasNotificationPermission,
  );
  const setNotificationsEnabled = useDeadlineStore(
    (state) => state.setNotificationsEnabled,
  );

  const onChangeLanguage = (nextLanguage: "th" | "en") => {
    setPendingLanguage(nextLanguage);
    void setAppLanguage(nextLanguage).finally(() => {
      setPendingLanguage(null);
    });
  };

  const onLogout = () => {
    void logout();
  };

  const onToggleNotifications = (enabled: boolean) => {
    void setNotificationsEnabled(enabled);
  };

  const onOpenSystemSettings = () => {
    void Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title">{t("settings")}</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.section}>
          <SettingsRow
            label={t("profile")}
            icon="person-outline"
            onPress={() => navigation.navigate(StackRoutes.Profile)}
          />
          <SettingsRow
            label={t("aboutApp")}
            icon="help-circle-outline"
            onPress={() => navigation.navigate(StackRoutes.AboutApp)}
          />
          <SettingsRow
            label={t("history")}
            icon="time-outline"
            onPress={() => navigation.navigate(StackRoutes.History)}
          />

          <View style={styles.toggleRow}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.textSecondary}
              />
              <AppText>{t("enableNotifications")}</AppText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              accessibilityLabel={t("enableNotifications")}
            />
          </View>

          {notificationsEnabled && !hasNotificationPermission ? (
            <View style={styles.notificationsHintCard}>
              <AppText variant="body">
                {t("notificationsDisabledTitle")}
              </AppText>
              <AppText variant="caption">
                {t("notificationsDisabledHint")}
              </AppText>
              <View style={styles.settingsButtonWrap}>
                <AppButton
                  label={t("openSettings")}
                  onPress={onOpenSystemSettings}
                  variant="outline"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.languageRow}>
            <AppText>{t("language")}</AppText>
            <View style={styles.languageButtons}>
              <Pressable
                onPress={() => onChangeLanguage("en")}
                style={[
                  styles.languageButton,
                  (pendingLanguage === "en" || language === "en") &&
                    styles.languageButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("english")}
              >
                <AppText>{t("english")}</AppText>
              </Pressable>
              <Pressable
                onPress={() => onChangeLanguage("th")}
                style={[
                  styles.languageButton,
                  (pendingLanguage === "th" || language === "th") &&
                    styles.languageButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("thai")}
              >
                <AppText>{t("thai")}</AppText>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.logoutWrap}>
          <AppButton
            label={t("logout")}
            onPress={onLogout}
            variant="outline"
            iconName="log-out-outline"
            iconColorToken="danger"
          />
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
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 36, height: 36 },
  section: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
  languageRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  toggleRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationsHintCard: {
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    gap: spacing.s,
    backgroundColor: colors.surface,
  },
  settingsButtonWrap: {
    marginTop: spacing.s,
  },
  languageButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  languageButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
  },
  languageButtonActive: {
    borderColor: colors.textPrimary,
  },
  logoutWrap: {
    marginTop: "auto",
    marginBottom: spacing.xl,
  },
});
