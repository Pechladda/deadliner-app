import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, Card, IconButton, Toast } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation";
import {
  formatDueLabel,
  getRemainingMs,
  getUrgencyMessage,
  t,
} from "@/src/core/utils";
import { useHomeNavigation } from "@/src/features/home-deadline-list/hooks/use-home-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, radius, spacing, typography } from "@/src/theme";

type HomeFilter = "all" | "urgent" | "soon" | "completed";

function isSameCalendarDay(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function urgencyMessageToLabel(
  message: ReturnType<typeof getUrgencyMessage>,
): string {
  if (message === "overdue") {
    return t("overdue");
  }

  if (message === "needsToday") {
    return t("needsAttentionToday");
  }

  if (message === "dueSoon") {
    return t("dueVerySoon");
  }

  return t("safeForNow");
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppText
        variant="caption"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.filterChipText, active && styles.filterChipTextActive]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
  const navigation = useHomeNavigation();
  const deadlines = useDeadlineStore((state) => state.deadlines);
  const completedDeadlines = useDeadlineStore(
    (state) => state.completedDeadlines,
  );
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);
  const isLoadingDeadlines = useDeadlineStore(
    (state) => state.isLoadingDeadlines,
  );
  const completeDeadline = useDeadlineStore((state) => state.completeDeadline);
  const undoCompletedDeadline = useDeadlineStore(
    (state) => state.undoCompletedDeadline,
  );
  const recentlyDeletedDeadline = useDeadlineStore(
    (state) => state.recentlyDeletedDeadline,
  );
  const undoDeleteDeadline = useDeadlineStore(
    (state) => state.undoDeleteDeadline,
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadDeadlines();
  }, [loadDeadlines]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onPressAdd = () => {
    navigation.navigate(TabRoutes.AddDeadline);
  };

  const onDone = (id: string) => {
    completeDeadline(id);
    setToastMessage(t("movedToHistory"));
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 1800);
  };

  const onUndoDelete = () => {
    void undoDeleteDeadline().then((success) => {
      if (success) {
        setToastMessage(t("restoredToActive"));
        setShowToast(true);
      }
    });
  };

  const nextDeadline = deadlines[0];
  const dueTodayCount = deadlines.filter((item) =>
    isSameCalendarDay(item.dueAt),
  ).length;
  const urgentCount = deadlines.filter(
    (item) => item.colorStatus === "red",
  ).length;

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const activeFiltered = deadlines.filter((item) => {
      if (!normalized) {
        return true;
      }

      return (
        item.assignmentName.toLowerCase().includes(normalized) ||
        item.courseName.toLowerCase().includes(normalized)
      );
    });

    if (filter === "urgent") {
      return activeFiltered.filter((item) => item.colorStatus === "red");
    }

    if (filter === "soon") {
      return activeFiltered.filter((item) => item.colorStatus === "yellow");
    }

    if (filter === "completed") {
      return completedDeadlines.filter((item) => {
        if (!normalized) {
          return true;
        }

        return (
          item.assignmentName.toLowerCase().includes(normalized) ||
          item.courseName.toLowerCase().includes(normalized)
        );
      });
    }

    return activeFiltered;
  }, [completedDeadlines, deadlines, filter, search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
      >
        <View
          style={[
            styles.headerRow,
            isCompact && styles.headerRowCompact,
            isWide && styles.headerRowWide,
          ]}
        >
          <AppText variant="title" style={styles.headerTitle}>
            {t("myDeadlines")}
          </AppText>
          <View style={styles.addButton}>
            <IconButton
              icon="add"
              onPress={onPressAdd}
              accessibilityLabel={t("createNewDeadline")}
            />
          </View>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <AppText variant="caption">{t("summaryTotalActive")}</AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(deadlines.length)}
              </AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AppText variant="caption">{t("summaryDueToday")}</AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(dueTodayCount)}
              </AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AppText variant="caption">{t("summaryUrgent")}</AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(urgentCount)}
              </AppText>
            </View>
          </View>
          <View style={styles.nextRow}>
            <AppText variant="caption">{t("summaryNext")}</AppText>
            <AppText variant="body" style={styles.nextText} numberOfLines={1}>
              {nextDeadline
                ? `${nextDeadline.assignmentName} • ${formatDueLabel(nextDeadline.dueAt)}`
                : t("homeEmptyHint")}
            </AppText>
          </View>
        </Card>

        <View style={styles.filterRow}>
          {[
            { key: "all", label: t("filterAll") },
            { key: "urgent", label: t("filterUrgent") },
            { key: "soon", label: t("filterSoon") },
            { key: "completed", label: t("filterCompleted") },
          ].map((item) => (
            <FilterChip
              key={item.key}
              label={item.label}
              active={filter === item.key}
              onPress={() => setFilter(item.key as HomeFilter)}
            />
          ))}
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("searchDeadlinePlaceholder")}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel={t("searchDeadlinePlaceholder")}
          />
        </View>

        {recentlyDeletedDeadline ? (
          <View style={styles.undoRow}>
            <AppButton
              label={t("undoDelete")}
              onPress={onUndoDelete}
              variant="outline"
              iconName="refresh-outline"
            />
          </View>
        ) : null}

        {isLoadingDeadlines ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primaryStrong} />
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingDeadlines}
                onRefresh={() => {
                  void loadDeadlines();
                }}
                tintColor={colors.primaryStrong}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <DeadlineCard
                  assignmentName={item.assignmentName}
                  courseName={item.courseName}
                  dueLabel={`${t("duePrefix")} ${formatDueLabel(item.dueAt)} • ${urgencyMessageToLabel(getUrgencyMessage(getRemainingMs(item.dueAt)))}`}
                  urgencyColor={item.colorStatus}
                  actionLabel={filter === "completed" ? t("undo") : t("done")}
                  onPressAction={() =>
                    filter === "completed"
                      ? undoCompletedDeadline(item.id)
                      : onDone(item.id)
                  }
                  muted={filter === "completed"}
                  onPressCard={
                    filter === "completed"
                      ? undefined
                      : () => {
                          navigation.navigate(StackRoutes.DeadlineDetail, {
                            id: item.id,
                          });
                        }
                  }
                  cardAccessibilityLabel={`${item.assignmentName}, ${t("due")} ${formatDueLabel(item.dueAt)}`}
                />
              </View>
            )}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <AppText variant="sectionTitle" style={styles.emptyTitle}>
                  {t("homeEmptyTitle")}
                </AppText>
                <AppText variant="caption" style={styles.emptyHint}>
                  {t("homeEmptyHint")}
                </AppText>
                <View style={styles.emptyActionWrap}>
                  <AppButton
                    label={t("createNewDeadline")}
                    onPress={onPressAdd}
                  />
                </View>
              </Card>
            }
          />
        )}

        <Toast message={toastMessage} visible={showToast} type="success" />
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
  },
  containerCompact: {
    paddingHorizontal: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: spacing.xl,
  },
  headerRowCompact: {
    marginBottom: spacing.l,
  },
  headerRowWide: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    textAlign: "center",
  },
  summaryCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.cardHighlight,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: "center",
    gap: spacing.xxs,
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: colors.border,
  },
  summaryValue: {
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed,
  },
  nextRow: {
    marginTop: spacing.m,
    gap: spacing.xs,
  },
  nextText: {
    fontWeight: typography.weight.semibold,
  },
  searchWrap: {
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  },
  searchInput: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfacePink,
    paddingHorizontal: spacing.l,
    color: colors.textPrimary,
    fontSize: typography.size.m,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.s,
    paddingHorizontal: spacing.l,
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.s,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  filterChipActive: {
    backgroundColor: colors.chipBgActive,
    borderColor: colors.border,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    textAlign: "center",
  },
  filterChipTextActive: {
    color: colors.textPrimary,
  },
  addButton: {
    position: "absolute",
    right: 0,
  },
  listContent: {
    gap: spacing.l,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  cardWrapper: {
    borderWidth: 0,
    borderColor: colors.borderSoft,
    borderRadius: radius.xxl,
    backgroundColor: "transparent",
    padding: 0,
    overflow: "hidden",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    marginTop: spacing.xxxl,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyHint: {
    textAlign: "center",
  },
  emptyActionWrap: {
    marginTop: spacing.l,
    width: "100%",
  },
  undoRow: {
    marginBottom: spacing.l,
  },
});
