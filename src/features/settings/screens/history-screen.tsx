import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, Card, IconButton, Toast } from "@/src/components";
import {
  formatDueLabel,
  getDeadlineStatus,
  getDeadlineStatusColor,
  t,
} from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, radius, spacing } from "@/src/theme";

function formatCompletedLabel(iso?: string | null) {
  if (!iso) {
    return "";
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

export function HistoryScreen() {
  const navigation = useSettingsNavigation();
  const completedDeadlines = useDeadlineStore(
    (state) => state.completedDeadlines,
  );
  const undoCompletedDeadline = useDeadlineStore(
    (state) => state.undoCompletedDeadline,
  );
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onUndo = (id: string) => {
    undoCompletedDeadline(id);
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1800);
  };

  const onGoBack = () => {
    navigation.goBack();
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
          <AppText variant="title">{t("history")}</AppText>
          <View style={styles.headerSpacer} />
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
                urgencyColor={getDeadlineStatusColor(
                  getDeadlineStatus(item.dueAt),
                )}
                actionLabel={t("undo")}
                onPressAction={() => onUndo(item.id)}
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

        <Toast message={t("restoredToActive")} visible={showToast} />
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
    justifyContent: "space-between",
    marginBottom: spacing.xl2,
  },
  headerSpacer: { width: 36, height: 36 },
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
    backgroundColor: colors.surfaceWarm,
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
