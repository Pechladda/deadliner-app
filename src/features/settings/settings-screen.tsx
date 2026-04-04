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
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const onChangeLanguage = (nextLanguage: "th" | "en") => {
    setPendingLanguage(nextLanguage);
    void setAppLanguage(nextLanguage).finally(() => {
      setPendingLanguage(null);
    });
  };

  const onLogout = () => {
    void (async () => {
      try {
        await logout();
        showToast(t("logoutSuccess"), "success");
      } catch {
        showToast(t("logoutFailed"), "error");
      }
    })();
  };

  const onToggleNotifications = (enabled: boolean) => {
    void setNotificationsEnabled(enabled);
  };

  const onOpenSystemSettings = () => {
    void Linking.openSettings();
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
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
            showToast(
              isSuccess ? t("allDataDeleted") : t("deleteFailed"),
              isSuccess ? "success" : "error",
            );
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
        <View
          style={[
            styles.contentInner,
            isCompact && styles.contentInnerCompact,
            isWide && styles.contentInnerWide,
          ]}
        >
          <View
            style={[styles.headerRow, isCompact && styles.headerRowCompact]}
          >
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

          <View style={styles.sectionBlock}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Account
            </AppText>
            <View style={styles.section}>
              <SettingsRow
                label={t("profile")}
                icon="person-outline"
                onPress={() => navigation.navigate(StackRoutes.Profile)}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Preferences
            </AppText>
            <View style={styles.section}>
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

              <SettingsRow
                label={t("history")}
                icon="time-outline"
                onPress={() => navigation.navigate(StackRoutes.History)}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <AppText variant="sectionTitle" style={styles.sectionTitle}>
              Support and Privacy
            </AppText>
            <View style={styles.section}>
              <SettingsRow
                label={t("privacyPolicy")}
                icon="shield-checkmark-outline"
                onPress={() => navigation.navigate(StackRoutes.PrivacyPolicy)}
              />
              <SettingsRow
                label={t("aboutApp")}
                icon="help-circle-outline"
                onPress={() => navigation.navigate(StackRoutes.AboutApp)}
              />

              <View style={styles.deleteActionWrap}>
                <AppButton
                  label={t("deleteAllData")}
                  onPress={onDeleteAllData}
                  variant="outline"
                  iconName="trash-outline"
                  iconColorToken="danger"
                  labelColorToken="danger"
                />
              </View>
            </View>
          </View>

          <View style={styles.accountActionWrap}>
            <AppButton
              label="Sign Out"
              onPress={onLogout}
              variant="outline"
              iconName="log-out-outline"
              iconColorToken="danger"
            />
          </View>
        </View>
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} type={toastType} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  contentContainer: {
    paddingBottom: spacing.l,
  },
  contentInner: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  contentInnerCompact: {
    maxWidth: 360,
  },
  contentInnerWide: {
    maxWidth: 460,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  headerRowCompact: {
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 38, height: 38 },
  screenTitle: {
    flex: 1,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sectionBlock: {
    marginTop: spacing.xl2,
    gap: spacing.s,
  },
  section: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
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
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  toggleRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
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
    gap: spacing.xs,
  },
  dataDetailText: {
    color: colors.textSecondary,
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
  accountActionWrap: {
    marginTop: spacing.s,
  },
  deleteActionWrap: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    paddingTop: spacing.s,
  },
  deleteActionButton: {
    minHeight: 48,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfacePink,
    paddingHorizontal: spacing.m,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  deleteActionText: {
    color: colors.danger,
    fontWeight: "600",
  },
});
