import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import {
    AppButton,
    AppText,
    Card,
    IconButton,
    PastelBackground,
} from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation/route-names";
import {
    formatCountdownLong,
    formatDueLabel,
    getDeadlineStatus,
    getDeadlineStatusDisplayColor,
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
import {
    colors,
    deadlineDetailTokens,
    radius,
    screenSharedTokens,
    shadows,
    spacing,
    typography,
} from "@/src/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

function ProgressArc({ ratio, color }: { ratio: number; color: string }) {
  const size = 168;
  const strokeWidth = 12;
  const radiusSize = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusSize;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: ratio,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.arcWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusSize}
          stroke={deadlineDetailTokens.arcTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radiusSize}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

function CountdownCard({ dueAt, status, now }: CountdownCardProps) {
  const urgencyMessage = getUrgencyMessage(getRemainingMs(dueAt, now));
  const statusColor = getDeadlineStatusDisplayColor(status);
  const accent =
    statusColor === "red"
      ? colors.priorityOverdue
      : statusColor === "orange"
        ? colors.priorityUrgent
        : statusColor === "yellow"
          ? colors.priorityYellow
          : colors.priorityGreen;

  const remainingMs = Math.max(0, getRemainingMs(dueAt, now));
  const progressRatio = Math.min(1, remainingMs / (7 * 24 * 60 * 60 * 1000));

  return (
    <BlurView intensity={24} tint="light" style={styles.countdownCard}>
      <View style={styles.countdownMain}>
        <ProgressArc ratio={progressRatio} color={accent} />
        <View style={styles.countdownLeft}>
          <View style={styles.countdownRow}>
            <Ionicons name="sparkles-outline" size={18} color={accent} />
            <AppText variant="title" style={styles.countdownText}>
              {formatCountdownLong(dueAt, now)}
            </AppText>
          </View>

          <View style={[styles.statusPill, { backgroundColor: accent }]}>
            <AppText style={styles.statusPillText}>
              {status === "overdue"
                ? t("overdue")
                : status === "urgent"
                  ? t("urgent")
                  : status === "soon"
                    ? t("soon")
                    : t("onTrack")}
            </AppText>
          </View>

          {urgencyMessage !== "overdue" ? (
            <AppText variant="caption" style={styles.urgencyHelperText}>
              {urgencyMessage === "needsToday"
                ? t("needsAttentionToday")
                : urgencyMessage === "dueSoon"
                  ? t("dueVerySoon")
                  : t("safeForNow")}
            </AppText>
          ) : null}

          <AppText variant="caption" style={styles.dueText}>
            {t("due")} {formatDueLabel(dueAt)}
          </AppText>
        </View>
      </View>
    </BlurView>
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
          size="compact"
          iconName="pencil-outline"
        />
      </View>
      <View style={styles.actionButtonWrap}>
        <AppButton
          label={t("delete")}
          onPress={onDelete}
          variant="outline"
          size="compact"
          iconName="trash-outline"
          iconColorToken="danger"
        />
      </View>
    </View>
  );
}

export function DeadlineDetailScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < screenSharedTokens.compactWidthThreshold;
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

  const status = getDeadlineStatus(deadline.dueAt, now);
  const palette = useMemo(() => {
    const statusColor = getDeadlineStatusDisplayColor(status);
    if (statusColor === "red") {
      return deadlineDetailTokens.heroPaletteOverdue;
    }
    if (statusColor === "orange") {
      return deadlineDetailTokens.heroPaletteUrgent;
    }
    if (statusColor === "yellow") {
      return deadlineDetailTokens.heroPaletteSoon;
    }
    return deadlineDetailTokens.heroPaletteOnTrack;
  }, [status]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <LinearGradient colors={palette} style={styles.heroHeader}>
          <BlurView
            intensity={24}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.headerRow}>
            <IconButton
              icon="chevron-back"
              onPress={onPressFallbackBack}
              accessibilityLabel={t("goBack")}
            />
            <AppText variant="caption" style={styles.headerCaption}>
              {t("assignmentDetail")}
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          <AppText
            variant="heading"
            style={styles.assignmentTitle}
            numberOfLines={2}
          >
            {deadline.assignmentName}
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            style={styles.courseText}
          >
            {deadline.courseName}
          </AppText>
        </LinearGradient>

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
    paddingTop: spacing.s,
    paddingBottom: spacing.l,
    gap: spacing.m,
  },
  containerCompact: {
    paddingHorizontal: spacing.m,
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
  heroHeader: {
    borderRadius: radius.xxl,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.shadowCard,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  headerCaption: {
    color: colors.textPrimary,
    letterSpacing: deadlineDetailTokens.headerCaptionLetterSpacing,
  },
  headerSpacer: { width: 38, height: 38 },
  assignmentTitle: {
    marginTop: spacing.s,
    marginBottom: spacing.xs,
  },
  courseText: {
    color: colors.textSecondary,
  },
  countdownCard: {
    borderRadius: radius.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: deadlineDetailTokens.countdownCardBackground,
    ...shadows.shadowCard,
  },
  countdownMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    gap: spacing.m,
  },
  arcWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  countdownLeft: {
    flex: 1,
    gap: spacing.s,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  countdownText: {
    fontSize: typography.size.xl,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusPillText: {
    color: colors.buttonText,
    fontFamily: typography.family.semibold,
    letterSpacing: deadlineDetailTokens.statusPillLetterSpacing,
  },
  urgencyHelperText: {
    color: colors.textSecondary,
  },
  dueText: {
    color: colors.primary,
  },
  metaCard: {
    borderRadius: radius.xl,
  },
  metaRow: {
    gap: spacing.xs,
  },
  metaValue: {
    fontFamily: typography.family.semibold,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    gap: spacing.m,
    paddingBottom: spacing.l,
    paddingTop: spacing.s,
  },
  actionButtonWrap: {
    flex: 1,
  },
});
