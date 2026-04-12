import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AppButton,
    AppText,
    Card,
    IconButton,
    PastelBackground,
    Toast,
} from "@/src/components";
import { t } from "@/src/core/utils";
import {
    formatCompletedLabel,
    formatDueLabel,
} from "@/src/core/utils/deadline-utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
    colors,
    radius,
    screenSharedTokens,
    spacing,
    typography,
} from "@/src/theme";

export function HistoryScreen() {
  const navigation = useSettingsNavigation();
  const completedDeadlines = useDeadlineStore(
    (state) => state.completedDeadlines,
  );
  const deleteDeadline = useDeadlineStore((state) => state.deleteDeadline);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onDelete = (id: string) => {
    void deleteDeadline(id).then((isSuccess) => {
      setToastMessage(isSuccess ? t("deletedDeadline") : t("deleteFailed"));
      setShowToast(true);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
      }, 1800);
    });
  };

  const onGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title" style={styles.screenTitle}>
            {t("history")}
          </AppText>
        </View>

        <FlatList
          data={completedDeadlines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <DeadlineCard
                assignmentName={item.assignmentName}
                courseName={item.courseName}
                dueLabel={`${t("originalDue")}: ${formatDueLabel(item.dueAt)}`}
                completedLabel={`${t("completedOn")}: ${formatCompletedLabel(item.completedAt)}`}
                urgencyColor="gray"
                actionLabel={t("delete")}
                actionStyle="trash"
                onPressAction={() => onDelete(item.id)}
                muted
              />
            </View>
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <AppText variant="sectionTitle" style={styles.emptyText}>
                {t("noHistoryYet")}
              </AppText>
              <View style={styles.emptyActionWrap}>
                <AppButton
                  label={t("goBack")}
                  onPress={onGoBack}
                  variant="outline"
                  iconName="arrow-back-outline"
                />
              </View>
            </Card>
          }
        />

        <Toast message={toastMessage} visible={showToast} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
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
    fontSize: typography.size.xl,
    lineHeight: screenSharedTokens.screenTitleLineHeight,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
  },
  listContent: {
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    padding: 3,
    overflow: "hidden",
  },
  emptyCard: {
    marginTop: spacing.xxl,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
  },
  emptyText: {
    textAlign: "center",
  },
  emptyActionWrap: {
    marginTop: spacing.l,
    width: "100%",
  },
});
