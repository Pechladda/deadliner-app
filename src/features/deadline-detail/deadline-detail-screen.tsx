import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import Svg, { Circle } from "react-native-svg";

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
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  layout,
  radius,
  spacing,
  typography
} from "@/src/theme";


function MissingState({ onPressBack }: MissingStateProps) {
  return (
    <View style={styles.center}>
      <IconButton
        icon="chevron-back"
        onPress={onPressBack}
        accessibilityLabel={"Go back"}
      />
      <AppText variant="section" style={styles.missingTitle}>
        {"No assignment selected"}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.missingText}>
        {"Please choose an assignment from Home to see its details."}
      </AppText>
    </View>
  );
}

export function DeadlineDetailScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < layout.thresholds.compact;
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeftAction}>
            <IconButton
              icon="chevron-back"
              onPress={onPressFallbackBack}
              accessibilityLabel={"Go back"}
            />
          </View>
          <AppText variant="section" style={styles.headerTitle}>
            {"Assignment Detail"}
          </AppText>
        </View>
        <View style={styles.cardBox}>
          {/* Card Header: Course Name & Status */}
          <View style={styles.cardHeaderRow}>
            <AppText style={styles.courseNameText} numberOfLines={1}>
              {deadline.courseName}
            </AppText>

            {(() => {
              const status = getDeadlineStatus(deadline.dueAt, now);
              let statusText: string = "On Track";
              let statusColor: string = colors.onTrack;

              if (deadline.isCompleted) {
                statusText = "Completed";
                statusColor = colors.textSecondary;
              } else {
                switch (status) {
                  case "overdue":
                    statusText = "Overdue";
                    statusColor = colors.overdue;
                    break;
                  case "urgent":
                    statusText = "Urgent";
                    statusColor = colors.urgent;
                    break;
                  case "soon":
                    statusText = "Soon";
                    statusColor = colors.soon;
                    break;
                }
              }

              return (
                <View style={[styles.statusTag, { backgroundColor: `${statusColor}20` }]}>
                  <AppText style={[styles.statusTagText, { color: statusColor }]}>
                    {statusText.toUpperCase()}
                  </AppText>
                </View>
              );
            })()}
          </View>

          {/* Assignment Info */}
          <View style={styles.assignmentInfoSection}>
            <AppText style={styles.assignmentNameText}>
              {deadline.assignmentName}
            </AppText>
          </View>

          <View style={styles.detailsSection}>
            {/* Due Date Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelColumn}>
                <AppText style={styles.detailLabel}>{"DUE DATE"}</AppText>
              </View>
              <View style={styles.detailValueColumn}>
                <AppText style={styles.detailValue}>
                  {formatDueLabel(deadline.dueAt)} • {deadline.dueTime}
                </AppText>
              </View>
            </View>

            <View style={styles.detailDivider} />

            {/* Created Date Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelColumn}>
                <AppText style={styles.detailLabel}>{"CREATED"}</AppText>
              </View>
              <View style={styles.detailValueColumn}>
                <AppText style={styles.detailValue}>
                  {formatCreatedLabel(deadline.createdAt)}
                </AppText>
              </View>
            </View>
          </View>
        </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  headerLeftAction: {
    zIndex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    textAlign: "left",
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statusTag: {
    paddingHorizontal: spacing.m,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusTagText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1,
  },
  assignmentInfoSection: {
    marginBottom: spacing.l,
  },
  courseNameText: {
    flex: 1,
    fontSize: typography.size.s,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginRight: spacing.s,
  },
  assignmentNameText: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.xxl,
    marginTop: spacing.s,
  },
  detailsSection: {
    gap: spacing.l,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailLabelColumn: {
    width: 100,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  detailValueColumn: {
    flex: 1,
  },
  detailValue: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    width: "100%",
  },

});
