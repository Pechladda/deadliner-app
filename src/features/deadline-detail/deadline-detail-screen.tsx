import { AppIcon } from "@/src/components";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, IconButton, PastelBackground } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation/route-names";
import {
  formatCreatedLabel,
  formatDueLabel,
  getDeadlineStatus,
} from "@/src/core/utils";
import {
  useDeadlineDetailNavigation,
  useDeadlineDetailRoute,
} from "@/src/features/deadline-detail/hooks/use-deadline-detail-screen";
import { MissingStateProps } from "@/src/features/deadline-detail/types";
import type { Deadline } from "@/src/models/deadline";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/src/theme";

const BRAND_PINK = "#EAB8C9";
const BRAND_PINK_LIGHT = "#FAF0F4";
const BRAND_PINK_BORDER = "#F0D0DC";
const BRAND_PINK_DEEP = "#C9849A";

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_HOUR = 60;
const TICK_INTERVAL_MS = MS_PER_MINUTE;

const CARD_BLUR_INTENSITY = 26;
const TIP_BLUR_INTENSITY = 20;
const MISSING_STATE_ICON_SIZE = 32;
const COURSE_CHIP_ICON_SIZE = 11;
const STATUS_TAG_ICON_SIZE = 11;
const DETAIL_ROW_ICON_SIZE = 14;
const COUNTDOWN_ICON_SIZE = 12;
const TIP_ICON_SIZE = 16;
const MISSING_DASH = "—";

type IoniconName = string;
type DeadlineStatus = ReturnType<typeof getDeadlineStatus>;

type StatusBadge = {
  text: string;
  color: string;
  icon: IoniconName;
};

type TipMessage = {
  icon: IoniconName;
  iconColor: string;
  text: string;
  textColor?: string;
};

function formatTimeRemaining(dueAt: string | null, now: Date): string {
  if (!dueAt) return MISSING_DASH;
  const diffMs = new Date(dueAt).getTime() - now.getTime();
  if (diffMs <= 0) return "Past due";
  const totalMinutes = Math.floor(diffMs / MS_PER_MINUTE);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function resolveStatusBadge(
  deadline: Deadline,
  status: DeadlineStatus | null,
): StatusBadge {
  if (deadline.isCompleted) {
    return {
      text: "Completed",
      color: String(colors.textSecondary),
      icon: "checkmark-done-circle",
    };
  }
  switch (status) {
    case "overdue":
      return {
        text: "Overdue",
        color: String(colors.overdue),
        icon: "alert-circle",
      };
    case "urgent":
      return {
        text: "Urgent",
        color: String(colors.urgent),
        icon: "flame",
      };
    case "soon":
      return {
        text: "Soon",
        color: String(colors.soon),
        icon: "time",
      };
    default:
      return {
        text: "On Track",
        color: String(colors.onTrack ?? BRAND_PINK),
        icon: "checkmark-circle",
      };
  }
}

function resolveTipMessage(
  deadline: Deadline,
  status: DeadlineStatus | null,
): TipMessage | null {
  if (deadline.isCompleted) return null;
  switch (status) {
    case "overdue":
      return {
        icon: "alert-circle-outline",
        iconColor: String(colors.overdue),
        text: "This assignment is past due.",
        textColor: String(colors.overdue),
      };
    case "urgent":
      return {
        icon: "sparkles-outline",
        iconColor: BRAND_PINK,
        text: "This is due soon — don't forget to submit! ",
      };
    case "soon":
      return {
        icon: "sparkles-outline",
        iconColor: BRAND_PINK,
        text: "Due in a few days — plan ahead and stay prepared! ",
      };
    case "onTrack":
      return {
        icon: "sparkles-outline",
        iconColor: BRAND_PINK,
        text: "You're on track — keep it up! ",
      };
    default:
      return null;
  }
}

function MissingState({ onPressBack }: MissingStateProps) {
  return (
    <View style={styles.center}>
      <View style={styles.missingIconWrap}>
        <AppIcon
          name="search-outline"
          size={MISSING_STATE_ICON_SIZE}
          color={BRAND_PINK}
        />
      </View>
      <AppText variant="section" style={styles.missingTitle}>
        {"No assignment selected"}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.missingText}>
        {"Please choose an assignment from Home to see its details."}
      </AppText>
      <IconButton
        icon="chevron-back"
        onPress={onPressBack}
        accessibilityLabel="Go back"
      />
    </View>
  );
}

type DetailRowProps = {
  icon: IoniconName;
  iconColor?: string;
  label: string;
  value: string;
  accent?: boolean;
};

function DetailRow({
  icon,
  iconColor = BRAND_PINK,
  label,
  value,
  accent = false,
}: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View
        style={[styles.detailIconBadge, { backgroundColor: iconColor + "18" }]}
      >
        <AppIcon name={icon} size={DETAIL_ROW_ICON_SIZE} color={iconColor} />
      </View>
      <View style={styles.detailTextCol}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <AppText
          style={[
            styles.detailValue,
            accent && {
              color: colors.textPrimary,
              fontWeight: typography.weight.semibold,
            },
          ]}
        >
          {value}
        </AppText>
      </View>
    </View>
  );
}

export function DeadlineDetailScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const route = useDeadlineDetailRoute();
  const navigation = useDeadlineDetailNavigation();
  const deadlineId = route.params?.id;
  const setSelectedId = useDeadlineStore((state) => state.setSelectedId);
  const deadline = useDeadlineStore((state) => {
    if (!deadlineId) return undefined;
    return state.getDeadlineById(deadlineId);
  });

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  const handleBack = () => {
    setSelectedId(null);
    navigation.replace(StackRoutes.MainTabs, { screen: TabRoutes.Home });
  };

  const hasDueDate = Boolean(deadline && deadline.dueAt);
  const deadlineStatus =
    deadline && hasDueDate ? getDeadlineStatus(deadline.dueAt, now) : null;

  const statusBadge = useMemo(
    () => (deadline ? resolveStatusBadge(deadline, deadlineStatus) : null),
    [deadline, deadlineStatus],
  );

  const tipMessage = useMemo(
    () => (deadline ? resolveTipMessage(deadline, deadlineStatus) : null),
    [deadline, deadlineStatus],
  );

  const timeRemaining =
    deadline && hasDueDate && !deadline.isCompleted
      ? formatTimeRemaining(deadline.dueAt, now)
      : null;

  if (!deadline || !statusBadge) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
        <MissingState onPressBack={handleBack} />
      </SafeAreaView>
    );
  }

  const dueDateValue = `${formatDueLabel(deadline.dueAt ?? "")} • ${deadline.dueTime ?? ""}`;
  const isOverdue = deadlineStatus === "overdue";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <PastelBackground />
      <View
        style={[styles.container, isCompactLayout && styles.containerCompact]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeftAction}>
            <IconButton
              icon="chevron-back"
              onPress={handleBack}
              accessibilityLabel="Go back"
            />
          </View>
          <AppText variant="section" style={styles.headerTitle}>
            {"Assignment Detail"}
          </AppText>
        </View>

        <BlurView
          intensity={CARD_BLUR_INTENSITY}
          tint="light"
          style={styles.cardBox}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.courseChip}>
              <AppIcon
                name="book-outline"
                size={COURSE_CHIP_ICON_SIZE}
                color={BRAND_PINK_DEEP}
              />
              <AppText style={styles.courseNameText} numberOfLines={1}>
                {deadline.courseName}
              </AppText>
            </View>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: statusBadge.color + "20" },
              ]}
            >
              <AppIcon
                name={statusBadge.icon}
                size={STATUS_TAG_ICON_SIZE}
                color={statusBadge.color}
              />
              <AppText
                style={[styles.statusTagText, { color: statusBadge.color }]}
              >
                {statusBadge.text.toUpperCase()}
              </AppText>
            </View>
          </View>

          <View style={styles.assignmentInfoSection}>
            <AppText style={styles.assignmentNameText}>
              {deadline.assignmentName}
            </AppText>

            {timeRemaining && (
              <View
                style={[
                  styles.countdownPill,
                  isOverdue && {
                    backgroundColor: colors.overdue + "15",
                    borderColor: colors.overdue + "30",
                  },
                ]}
              >
                <AppIcon
                  name="hourglass-outline"
                  size={COUNTDOWN_ICON_SIZE}
                  color={isOverdue ? colors.overdue : BRAND_PINK_DEEP}
                />
                <AppText
                  style={[
                    styles.countdownText,
                    isOverdue && { color: colors.overdue },
                  ]}
                >
                  {timeRemaining}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.detailsSection}>
            <DetailRow
              icon="calendar"
              iconColor={BRAND_PINK_DEEP}
              label="DUE DATE"
              value={dueDateValue}
              accent
            />

            <View style={styles.detailDivider} />

            <DetailRow
              icon="time-outline"
              iconColor={colors.textSecondary}
              label="CREATED"
              value={formatCreatedLabel(deadline.createdAt)}
            />

            {deadline.reminder && (
              <>
                <View style={styles.detailDivider} />
                <DetailRow
                  icon="notifications-outline"
                  iconColor={BRAND_PINK}
                  label="REMINDER"
                  value={deadline.reminder}
                />
              </>
            )}

            {deadline.isCompleted && (
              <>
                <View style={styles.detailDivider} />
                <DetailRow
                  icon="checkmark-done-circle-outline"
                  iconColor={colors.textSecondary}
                  label="STATUS"
                  value="Completed ✓"
                />
              </>
            )}
          </View>
        </BlurView>

        {tipMessage && (
          <BlurView
            intensity={TIP_BLUR_INTENSITY}
            tint="light"
            style={styles.tipCard}
          >
            <AppIcon
              name={tipMessage.icon}
              size={TIP_ICON_SIZE}
              color={tipMessage.iconColor}
            />
            <AppText
              style={[
                styles.tipText,
                tipMessage.textColor
                  ? { color: tipMessage.textColor }
                  : undefined,
              ]}
            >
              {tipMessage.text}
            </AppText>
          </BlurView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.l,
    gap: spacing.m,
  },
  containerCompact: { paddingHorizontal: spacing.m },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
    gap: spacing.m,
  },
  missingIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BRAND_PINK_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  missingTitle: { textAlign: "center" },
  missingText: { textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  headerLeftAction: { zIndex: 1 },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    textAlign: "left",
    marginLeft: spacing.xs,
    marginTop: spacing.m,
  },
  cardBox: {
    borderRadius: radius.m,
    overflow: "hidden",
    padding: spacing.l,
    gap: spacing.m,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.s,
  },
  courseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BRAND_PINK_LIGHT,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: BRAND_PINK_BORDER,
    paddingHorizontal: spacing.s,
    paddingVertical: 5,
    maxWidth: "60%",
  },
  courseNameText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: BRAND_PINK_DEEP,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.8,
  },
  assignmentInfoSection: {
    gap: spacing.s,
  },
  assignmentNameText: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xxl,
  },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: BRAND_PINK_LIGHT,
    borderWidth: 1,
    borderColor: BRAND_PINK_BORDER,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 5,
  },
  countdownText: {
    fontSize: typography.size.xs,
    color: BRAND_PINK_DEEP,
    fontWeight: typography.weight.semibold,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border ?? BRAND_PINK_BORDER,
    opacity: 0.4,
    marginHorizontal: -spacing.l,
  },
  detailsSection: { gap: spacing.m },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
  detailIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  detailTextCol: { flex: 1, gap: 2 },
  detailLabel: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border ?? BRAND_PINK_BORDER,
    opacity: 0.3,
    marginLeft: 44,
  },
  tipCard: {
    borderRadius: radius.m,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  tipText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: BRAND_PINK_DEEP,
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.xs,
  },
});
