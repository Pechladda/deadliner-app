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
import {
  formatCompletedLabel,
  formatDueLabel,
} from "@/src/core/utils/deadline-utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, constants, radius, spacing, typography } from "@/src/theme";

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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
            <Card style={styles.emptyCard}>
              <AppText variant="section" style={styles.emptyText}>
                {"No completed deadlines yet."}
              </AppText>
              <View style={styles.emptyActionWrap}>
                <AppButton
                  label={"Go back"}
                  onPress={handleGoBack}
                  variant="outline"
                  iconName="arrow-back-outline"
                />
              </View>
            </Card>
          }
        />

        <Toast message={toastMessage} visible={isToastVisible} />
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
