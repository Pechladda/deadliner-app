import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppButton, AppText, PastelBackground, Toast } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation/route-names";

import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  constants,
  layout,
  radius,
  spacing,
  typography,
} from "@/src/theme";

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
        <AppText variant="caption">{label}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < layout.thresholds.compact;
  const isWide = width >= layout.thresholds.wide;
  const navigation = useSettingsNavigation();
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
  const refreshNotificationPermission = useDeadlineStore(
    (state) => state.refreshNotificationPermission,
  );
  const clearAllData = useDeadlineStore((state) => state.clearAllData);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const onLogout = () => {
    void (async () => {
      try {
        await logout();
        showToast("Logged out successfully", "success");
      } catch {
        showToast("Unable to log out right now. Please try again.", "error");
      }
    })();
  };

  const onToggleNotifications = (enabled: boolean) => {
    if (!hasNotificationPermission) {
      return;
    }

    void setNotificationsEnabled(enabled);
  };

  useFocusEffect(
    useCallback(() => {
      void refreshNotificationPermission();
    }, [refreshNotificationPermission]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshNotificationPermission();
      }
    });

    return () => subscription.remove();
  }, [refreshNotificationPermission]);

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
    Alert.alert(
      "Delete all app data",
      "This will permanently remove all deadlines and history. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void clearAllData().then((isSuccess) => {
              showToast(
                isSuccess
                  ? "All app data deleted"
                  : "Could not delete this deadline. Please try again.",
                isSuccess ? "success" : "error",
              );
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <ScrollView
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 12 },
        ]}
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
            <AppText variant="section" style={styles.screenTitle}>
              {"Settings"}
            </AppText>
          </View>

          <View style={styles.sectionBlock}>
            <AppText variant="section" style={styles.sectionTitle}>
              {"Account"}
            </AppText>
            <View style={styles.section}>
              <SettingsRow
                label={"Profile"}
                icon="person-outline"
                onPress={() => navigation.navigate(StackRoutes.Profile)}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <AppText variant="section" style={styles.sectionTitle}>
              {"Preferences"}
            </AppText>
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={[styles.rowLeft, styles.toggleRowLeft]}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <AppText variant="caption">{"Enable Notifications"}</AppText>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={onToggleNotifications}
                  disabled={!hasNotificationPermission}
                  trackColor={{
                    false: hasNotificationPermission
                      ? colors.border
                      : colors.borderSoft,
                    true: hasNotificationPermission
                      ? colors.textSecondary
                      : colors.borderSoft,
                  }}
                  thumbColor={
                    hasNotificationPermission
                      ? colors.surface
                      : colors.textSecondary
                  }
                  ios_backgroundColor={colors.borderSoft}
                  accessibilityLabel={"Enable Notifications"}
                />
              </View>

              {!hasNotificationPermission ? (
                <View style={styles.notificationsHintCard}>
                  <AppText variant="body">
                    {"Notifications are disabled"}
                  </AppText>
                  <AppText variant="caption">
                    {"Enable in system settings."}
                  </AppText>
                  <View style={styles.settingsButtonWrap}>
                    <AppButton
                      label={"Open Settings"}
                      onPress={onOpenSystemSettings}
                      variant="solid"
                      size="compact"
                      labelVariant="body"
                      labelColorToken="surface"
                    />
                  </View>
                </View>
              ) : null}

              <SettingsRow
                label={"History"}
                icon="time-outline"
                onPress={() => navigation.navigate(StackRoutes.History)}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <AppText variant="section" style={styles.sectionTitle}>
              {"Support & Privacy"}
            </AppText>
            <View style={styles.section}>
              <SettingsRow
                label={"Privacy Policy"}
                icon="shield-checkmark-outline"
                onPress={() => navigation.navigate(StackRoutes.PrivacyPolicy)}
              />
              <SettingsRow
                label={"About App"}
                icon="help-circle-outline"
                onPress={() => navigation.navigate(StackRoutes.AboutApp)}
              />
            </View>
          </View>

          <View style={styles.accountActionWrap}>
            <AppButton
              label={"Delete All Data"}
              onPress={onDeleteAllData}
              variant="solid"
              iconName="trash-outline"
              size="compact"
              labelVariant="body"
            />
          </View>

          <View style={styles.accountActionWrap}>
            <AppButton
              label={"Sign Out"}
              onPress={onLogout}
              variant="solid"
              iconName="log-out-outline"
              size="compact"
              labelVariant="body"
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
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  containerCompact: {
    paddingHorizontal: spacing.s,
    paddingTop: spacing.s,
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
    maxWidth: layout.maxWidths.default,
    alignSelf: "center",
  },
  contentInnerCompact: {
    maxWidth: layout.maxWidths.compact,
  },
  contentInnerWide: {
    maxWidth: layout.maxWidths.wide,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: spacing.s,
  },
  headerRowCompact: {
    marginBottom: spacing.l,
  },
  screenTitle: {
    textAlign: "left",
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  sectionTitle: {
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
    color: colors.textSecondary,
    fontWeight: typography.weight.semibold,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.s,
  },
  sectionBlock: {
    marginTop: spacing.s,
    gap: spacing.s,
  },
  section: {
    borderRadius: radius.s,
    backgroundColor: colors.surface,
    borderWidth: 0,
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
    borderBottomWidth: 0,
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
  toggleRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderBottomWidth: 0,
    borderBottomColor: colors.borderSoft,
  },
  notificationsHintCard: {
    marginHorizontal: spacing.l,
    marginVertical: spacing.m,
    borderColor: colors.border,
    borderRadius: radius.s,
    padding: spacing.m,
    gap: spacing.s,
    backgroundColor: colors.surface,
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
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.s,
  },
  settingsButtonWrap: {
    marginTop: spacing.s,
  },
  accountActionWrap: {
    marginTop: spacing.l,
  },
  deleteActionWrap: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    borderRadius: radius.s,
  },
});
