import { useEffect, useState } from "react";
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import Svg, { Circle } from "react-native-svg";

import { AppText, IconButton, PastelBackground } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation/route-names";
import { getDeadlineStatus } from "@/src/core/utils";
import {
  useDeadlineDetailNavigation,
  useDeadlineDetailRoute,
} from "@/src/features/deadline-detail/hooks/use-deadline-detail-screen";
import { MissingStateProps } from "@/src/features/deadline-detail/types";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, screenSharedTokens, spacing, typography } from "@/src/theme";

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
            void deleteDeadline(deadline.id).then((isSuccess) => {
              if (!isSuccess) {
                Alert.alert(
                  "Error",
                  "Could not delete this deadline. Please try again.",
                );
                return;
              }

              setSelectedId(null);
              navigation.replace(StackRoutes.MainTabs, {
                screen: TabRoutes.Home,
              });
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={onPressFallbackBack}
            accessibilityLabel={"Go back"}
          />
          <AppText variant="section" style={styles.headerTitle}>
            {"Assignment Detail"}
          </AppText>
        </View>
        {/* White Card Box */}
        <View
          style={[styles.cardBox, styles.cardBoxCenter, styles.cardBoxModern]}
        >
          {/* Assignment Title */}
          <AppText
            style={{
              fontSize: typography.size.l,
              fontWeight: typography.weight.bold,
              marginBottom: spacing.s,
              color: colors.textPrimary,
              textAlign: "center",
            }}
          >
            {deadline.assignmentName}
          </AppText>

          {/* Subject / Course Badge + Status */}
          <View
            style={[
              styles.badgeModern,
              {
                marginBottom: spacing.s,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              },
            ]}
          >
            <AppText
              style={{
                color: colors.primary,
                fontWeight: "500",
                fontSize: typography.size.xs,
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              {deadline.courseName}
            </AppText>
          </View>

          {/* Status */}
          {(() => {
            const status = getDeadlineStatus(deadline.dueAt, now);
            let statusText: string = "";
            let statusColor: string = colors.textSecondary;
            let statusIcon = "";
            if (deadline.isCompleted) {
              statusText = "Completed";
              statusColor = colors.success;
              statusIcon = "✔️ ";
            } else {
              switch (status) {
                case "overdue":
                  statusText = "Overdue";
                  statusColor = colors.danger;
                  break;
                case "urgent":
                  statusText = "Due Soon";
                  statusColor = colors.warning;
                  break;
                case "soon":
                  statusText = "Coming Up";
                  statusColor = colors.info;
                  break;
                default:
                  statusText = "On Track";
                  statusColor = colors.textSecondary;
                  statusIcon = "";
              }
            }
            return (
              <AppText
                style={{
                  color: statusColor,
                  fontWeight: "bold",
                  marginBottom: spacing.xs,
                  textAlign: "center",
                  fontSize: typography.size.s,
                  letterSpacing: 0.2,
                }}
              >
                {statusIcon}
                {statusText}
              </AppText>
            );
          })()}
          {/* Divider */}
          <View style={styles.dividerModern} />

          {/* Due Date & Time */}
          <AppText
            style={{
              color: colors.textSecondary,
              marginBottom: spacing.xs,
              textAlign: "center",
              fontSize: typography.size.xs,
              letterSpacing: 0.1,
            }}
          >
            <AppText style={{ fontWeight: "bold", color: colors.textPrimary }}>
              Due:
            </AppText>{" "}
            {deadline.dueDate} {deadline.dueTime}
          </AppText>

          {/* Created Date */}
          <AppText
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginBottom: spacing.xs,
              textAlign: "center",
              letterSpacing: 0.1,
            }}
          >
            <AppText style={{ fontWeight: "bold", color: colors.textPrimary }}>
              Created:
            </AppText>{" "}
            {deadline.createdAt}
          </AppText>
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
    justifyContent: "flex-start",
    marginBottom: spacing.s,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
    marginLeft: spacing.m,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing.m,
  },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: spacing.m,
  },
  cardBoxModern: {
    gap: spacing.s,
  },
  badgeModern: {
    alignSelf: "center",
    backgroundColor: colors.accentMint,
    borderRadius: 999,
    paddingHorizontal: spacing.l,
    paddingVertical: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dividerModern: {
    width: "80%",
    height: 1,
    backgroundColor: colors.borderSoft,
    alignSelf: "center",
    marginVertical: spacing.xs,
    borderRadius: 1,
  },
  cardBoxCenter: {
    alignItems: "center",
  },
});
