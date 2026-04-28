import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
  IconButton,
  PastelBackground,
  Toast,
} from "@/src/components";
import {
  formatCompletedLabel,
  formatDueLabel,
} from "@/src/core/utils/deadline-utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, constants, radius, spacing, typography } from "@/src/theme";

const BRAND_PINK = "#EAB8C9";
const EMPTY_STATE_BLUR_INTENSITY = 26;
const EMPTY_STATE_ICON_SIZE = 32;

const TOAST_DURATION_MS = 1800;
const CARD_WRAPPER_PADDING = 3;

const DELETE_SUCCESS_MESSAGE = "Deadline deleted";
const DELETE_FAILURE_MESSAGE =
  "Could not delete this deadline. Please try again.";

export function HistoryScreen() {
  const navigation = useSettingsNavigation();
  const completedDeadlines = useDeadlineStore(
    (state) => state.completedDeadlines,
  );
  const deleteDeadline = useDeadlineStore((state) => state.deleteDeadline);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleDelete = (deadlineId: string) => {
    void deleteDeadline(deadlineId).then((isSuccess) => {
      setToastMessage(
        isSuccess ? DELETE_SUCCESS_MESSAGE : DELETE_FAILURE_MESSAGE,
      );
      setIsToastVisible(true);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastTimerRef.current = setTimeout(() => {
        setIsToastVisible(false);
      }, TOAST_DURATION_MS);
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <PastelBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={handleGoBack}
            accessibilityLabel={"Go back"}
          />
          <AppText variant="section" style={styles.screenTitle}>
            {"History"}
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
                dueLabel={`${"Original due"}: ${formatDueLabel(item.dueAt)}`}
                completedLabel={`${"Completed"}: ${formatCompletedLabel(item.completedAt)}`}
                urgencyColor="green"
                actionLabel={"Delete"}
                actionStyle="trash"
                onPressAction={() => handleDelete(item.id)}
                muted
              />
            </View>
          )}
          ListEmptyComponent={
            <BlurView
              intensity={EMPTY_STATE_BLUR_INTENSITY}
              tint="light"
              style={styles.emptyStateCard}
            >
              <AppIcon
                name="time-outline"
                size={EMPTY_STATE_ICON_SIZE}
                color={BRAND_PINK}
              />
              <AppText variant="section" style={styles.emptyStateTitle}>
                {"No completed deadlines yet."}
              </AppText>
              <AppText variant="caption" style={styles.emptyStateHint}>
                {"Deadlines you mark as done will appear here."}
              </AppText>
            </BlurView>
          }
        />

        <Toast message={toastMessage} visible={isToastVisible} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
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
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  listContent: {
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    borderWidth: 0,
    borderColor: colors.border,
    borderRadius: radius.s,
    backgroundColor: colors.surface,
    padding: CARD_WRAPPER_PADDING,
    overflow: "hidden",
  },
  emptyStateCard: {
    borderRadius: radius.m,
    overflow: "hidden",
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.m,
    marginTop: spacing.l,
  },
  emptyStateTitle: {
    textAlign: "center",
    color: colors.textPrimary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.weight.semibold,
  },
  emptyStateHint: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
  },
});
