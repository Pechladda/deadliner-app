import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, IconButton, Toast } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { useLanguage } from "@/src/providers/language-provider";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, radius, spacing } from "@/src/theme";

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
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
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
  const clearAllData = useDeadlineStore((state) => state.clearAllData);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  const onDeleteAllData = () => {
    Alert.alert(t("deleteAllDataTitle"), t("deleteAllDataConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          void clearAllData().then((isSuccess) => {
            showToast(isSuccess ? t("allDataDeleted") : t("deleteFailed"));
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, isCompact && styles.headerRowCompact]}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title" style={styles.screenTitle}>
            {t("settings")}
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          {t("settingsAppSection")}
        </AppText>
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
            label={t("privacyPolicy")}
            icon="shield-checkmark-outline"
            onPress={() => navigation.navigate(StackRoutes.PrivacyPolicy)}
          />
          <SettingsRow
            label={t("history")}
            icon="time-outline"
            onPress={() => navigation.navigate(StackRoutes.History)}
          />

          <View style={styles.toggleRow}>
            <View style={[styles.rowLeft, styles.toggleRowLeft]}>
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

        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          {t("settingsDataSection")}
        </AppText>
        <View style={styles.section}>
          <View style={styles.dataSummaryWrap}>
            <AppText variant="caption">{t("dataUsageSummary")}</AppText>
          </View>

          <View style={styles.privacyActionsWrap}>
            <AppButton
              label={t("deleteAllData")}
              onPress={onDeleteAllData}
              variant="outline"
              iconName="trash-outline"
              iconColorToken="danger"
            />
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
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} type="success" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.l },
  containerCompact: { paddingHorizontal: spacing.m },
  containerWide: { paddingHorizontal: spacing.xl },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl2,
  },
  headerRowCompact: {
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 36, height: 36 },
  screenTitle: {
    flex: 1,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: spacing.s,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.s,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  section: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
  toggleRowLeft: {
    flex: 1,
  },
  languageRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  toggleRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  notificationsHintCard: {
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.m,
    gap: spacing.s,
    backgroundColor: colors.surfacePink,
  },
  dataSummaryWrap: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  privacyActionsWrap: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfacePink,
  },
  languageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chipBgActive,
  },
  logoutWrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
});
