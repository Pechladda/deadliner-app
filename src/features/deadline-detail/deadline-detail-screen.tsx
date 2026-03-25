import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, Card, IconButton } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation";
import {
    computeColorStatus,
    formatCountdownLong,
    formatDueLabel,
    getRemainingMs,
    getUrgencyMessage,
    t,
} from "@/src/core/utils";
import {
    useDeadlineDetailNavigation,
    useDeadlineDetailRoute,
} from "@/src/features/deadline-detail/hooks/use-deadline-detail-screen";
import {
    ActionRowProps,
    CountdownCardProps,
    MissingStateProps,
} from "@/src/features/deadline-detail/types";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, radius, spacing, typography } from "@/src/theme";

function MissingState({ onPressBack }: MissingStateProps) {
  return (
    <View style={styles.center}>
      <IconButton
        icon="chevron-back"
        onPress={onPressBack}
        accessibilityLabel={t("goBack")}
      />
      <AppText variant="heading" style={styles.missingTitle}>
        {t("noAssignmentSelected")}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.missingText}>
        {t("chooseAssignmentHint")}
      </AppText>
    </View>
  );
}

function CountdownCard({ dueAt, status, now }: CountdownCardProps) {
  const urgencyMessage = getUrgencyMessage(getRemainingMs(dueAt, now));

  return (
    <Card style={styles.countdownCard} highlighted>
      <View style={styles.countdownLeft}>
        <View style={styles.countdownRow}>
          <Ionicons
            name="alarm-outline"
            size={18}
            color={
              status === "red"
                ? colors.priorityRed
                : status === "yellow"
                  ? colors.priorityYellow
                  : colors.priorityGreen
            }
          />
          <AppText variant="title" style={styles.countdownText}>
            {formatCountdownLong(dueAt, now)}
          </AppText>
        </View>

        <View
          style={[
            styles.statusPill,
            status === "red" && styles.pillRed,
            status === "yellow" && styles.pillYellow,
            status === "green" && styles.pillGreen,
          ]}
        >
          <AppText style={styles.statusPillText}>
            {status === "red"
              ? t("urgent")
              : status === "yellow"
                ? t("soon")
                : t("onTrack")}
          </AppText>
        </View>

        <AppText variant="caption" style={styles.urgencyHelperText}>
          {urgencyMessage === "overdue"
            ? t("overdue")
            : urgencyMessage === "needsToday"
              ? t("needsAttentionToday")
              : urgencyMessage === "dueSoon"
                ? t("dueVerySoon")
                : t("safeForNow")}
        </AppText>

        <AppText variant="caption" style={styles.dueText}>
          {t("due")} {formatDueLabel(dueAt)}
        </AppText>
      </View>
    </Card>
  );
}

function ActionRow({ onEdit, onDelete }: ActionRowProps) {
  return (
    <View style={styles.buttonRow}>
      <View style={styles.actionButtonWrap}>
        <AppButton
          label={t("edit")}
          onPress={onEdit}
          variant="solid"
          iconName="pencil-outline"
        />
      </View>
      <View style={styles.actionButtonWrap}>
        <AppButton
          label={t("delete")}
          onPress={onDelete}
          variant="outline"
          iconName="trash-outline"
          iconColorToken="danger"
        />
      </View>
    </View>
  );
}

export function DeadlineDetailScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
  const route = useDeadlineDetailRoute();
  const navigation = useDeadlineDetailNavigation();
  const deadlineId = route.params?.id;
  const setSelectedId = useDeadlineStore((state) => state.setSelectedId);
  const deadline = useDeadlineStore((state) => {
    if (!deadlineId) {
      return undefined;
    }

    return state.getDeadlineById(deadlineId);
  });
  const deleteDeadline = useDeadlineStore((state) => state.deleteDeadline);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(timerId);
  }, []);

  const onPressEdit = () => {
    if (!deadline) {
      return;
    }

    navigation.navigate(StackRoutes.MainTabs, {
      screen: TabRoutes.AddDeadline,
      params: { mode: "edit", id: deadline.id },
    });
  };

  const onPressDelete = () => {
    if (!deadline) {
      return;
    }

    Alert.alert(t("deleteDeadlineTitle"), t("deleteDeadlineConfirm"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          void deleteDeadline(deadline.id).then((isSuccess) => {
            if (!isSuccess) {
              Alert.alert(t("error"), t("deleteFailed"));
              return;
            }

            setSelectedId(null);
            navigation.replace(StackRoutes.MainTabs, {
              screen: TabRoutes.Home,
            });
          });
        },
      },
    ]);
  };

  const onPressFallbackBack = () => {
    setSelectedId(null);
    navigation.replace(StackRoutes.MainTabs, { screen: TabRoutes.Home });
  };

  if (!deadline) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <MissingState onPressBack={onPressFallbackBack} />
      </SafeAreaView>
    );
  }

  const remainingMs = getRemainingMs(deadline.dueAt, now);
  const status = computeColorStatus(remainingMs);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
      >
        <View style={[styles.headerRow, isCompact && styles.headerRowCompact]}>
          <IconButton
            icon="chevron-back"
            onPress={onPressFallbackBack}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title" style={styles.screenTitle}>
            {t("assignmentDetail")}
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        <Card style={styles.assignmentCard}>
          <AppText variant="sectionTitle" style={styles.assignmentTitle}>
            {deadline.assignmentName}
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            style={styles.courseText}
          >
            {deadline.courseName}
          </AppText>
        </Card>

        <CountdownCard dueAt={deadline.dueAt} now={now} status={status} />

        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <AppText variant="caption">{t("reminderInfo")}</AppText>
            <AppText variant="body" style={styles.metaValue}>
              {deadline.reminder
                ? deadline.reminder === "5m"
                  ? t("reminder5m")
                  : deadline.reminder === "30m"
                    ? t("reminder30m")
                    : deadline.reminder === "1h"
                      ? t("reminder1h")
                      : t("reminder1d")
                : t("noReminderSelected")}
            </AppText>
          </View>
        </Card>

        <ActionRow onEdit={onPressEdit} onDelete={onPressDelete} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    gap: spacing.xl,
  },
  containerCompact: {
    paddingHorizontal: spacing.m,
    gap: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
    gap: spacing.m,
  },
  missingTitle: { textAlign: "center" },
  missingText: { textAlign: "center" },
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
    textAlign: "center",
  },
  assignmentCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  assignmentTitle: {
    textAlign: "center",
    marginTop: spacing.xxs,
  },
  courseText: {
    textAlign: "center",
  },
  countdownCard: {
    marginTop: spacing.xs,
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.xl,
    backgroundColor: colors.cardHighlight,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  countdownLeft: {
    gap: spacing.m,
    alignItems: "center",
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s,
  },
  countdownText: {
    textAlign: "center",
  },
  statusPill: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.buttonText,
  },
  urgencyHelperText: {
    color: colors.textSecondary,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  pillRed: {
    backgroundColor: colors.priorityRed,
  },
  pillYellow: {
    backgroundColor: colors.priorityYellow,
  },
  pillGreen: {
    backgroundColor: colors.priorityGreen,
  },
  dueText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metaCard: {
    backgroundColor: colors.surfacePink,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    gap: spacing.s,
    alignItems: "center",
  },
  metaValue: {
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    gap: spacing.m,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.s,
  },
  actionButtonWrap: {
    flex: 1,
  },
});
