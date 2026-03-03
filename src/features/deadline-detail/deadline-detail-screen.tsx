import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, Card, IconButton } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation";
import {
  computeColorStatus,
  formatCountdownLong,
  formatDueLabel,
  getRemainingMs,
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
import { colors, spacing } from "@/src/theme";

function MissingState({ onPressBack }: MissingStateProps) {
  return (
    <View style={styles.center}>
      <IconButton
        icon="chevron-back"
        onPress={onPressBack}
        accessibilityLabel="Go back"
      />
      <AppText variant="heading" style={styles.missingTitle}>
        No assignment selected
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.missingText}>
        Please choose an assignment from Home to see its details.
      </AppText>
    </View>
  );
}

function CountdownCard({ dueAt, status, now }: CountdownCardProps) {
  return (
    <Card style={styles.countdownCard}>
      <View style={styles.countdownLeft}>
        <View style={styles.countdownRow}>
          <Ionicons
            name="alarm-outline"
            size={18}
            color={
              status === "red"
                ? colors.danger
                : status === "yellow"
                  ? colors.warning
                  : colors.success
            }
          />
          <AppText style={styles.countdownText}>
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
              ? "URGENT"
              : status === "yellow"
                ? "SOON"
                : "ON TRACK"}
          </AppText>
        </View>

        <AppText variant="caption" style={styles.dueText}>
          Due {formatDueLabel(dueAt)}
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
          label="Edit"
          onPress={onEdit}
          variant="outline"
          iconName="pencil-outline"
        />
      </View>
      <View style={styles.actionButtonWrap}>
        <AppButton
          label="Delete"
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

    Alert.alert(
      "Delete deadline",
      "Are you sure you want to delete this assignment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteDeadline(deadline.id);
            setSelectedId(null);
            navigation.replace(StackRoutes.MainTabs, {
              screen: TabRoutes.Home,
            });
          },
        },
      ],
    );
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
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={onPressFallbackBack}
            accessibilityLabel="Go back"
          />
          <AppText variant="title">Assignment Detail</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <AppText variant="heading" style={styles.assignmentTitle}>
          {deadline.assignmentName}
        </AppText>
        <AppText
          variant="body"
          color="textSecondary"
          style={{ textAlign: "center" }}
        >
          {deadline.courseName}
        </AppText>

        <CountdownCard dueAt={deadline.dueAt} now={now} status={status} />

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
    gap: spacing.m,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
    gap: spacing.s,
  },
  missingTitle: { textAlign: "center" },
  missingText: { textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 36, height: 36 },
  assignmentTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  countdownCard: {
    marginTop: spacing.s,
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.s,
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
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  statusPill: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.buttonText,
  },
  pillRed: {
    backgroundColor: colors.danger,
  },
  pillYellow: {
    backgroundColor: colors.warning,
  },
  pillGreen: {
    backgroundColor: colors.success,
  },
  dueText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    gap: spacing.s,
    paddingBottom: spacing.xl,
  },
  actionButtonWrap: {
    flex: 1,
  },
});
