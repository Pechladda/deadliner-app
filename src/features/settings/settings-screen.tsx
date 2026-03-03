import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, IconButton } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { getLanguage, setLanguage, t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
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
  const [language, setLanguageState] = useState(getLanguage());

  const onPressSetting = (label: string) => {
    Alert.alert(label, t("comingSoon"));
  };

  const onChangeLanguage = (nextLanguage: "th" | "en") => {
    setLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  const onLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: StackRoutes.Login }],
    });
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
            label={t("notifications")}
            icon="notifications-outline"
            onPress={() => onPressSetting(t("notifications"))}
          />
          <SettingsRow
            label={t("aboutApp")}
            icon="help-circle-outline"
            onPress={() => navigation.navigate(StackRoutes.AboutApp)}
          />

          <View style={styles.languageRow}>
            <AppText>{t("language")}</AppText>
            <View style={styles.languageButtons}>
              <Pressable
                onPress={() => onChangeLanguage("en")}
                style={[
                  styles.languageButton,
                  language === "en" && styles.languageButtonActive,
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
                  language === "th" && styles.languageButtonActive,
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
