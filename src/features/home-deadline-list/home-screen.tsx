import { onAuthStateChanged } from "firebase/auth";
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

import { AppText, Card, IconButton, Toast } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation";
import {
  formatDueLabel,
  getDeadlineStatus,
  getDeadlineStatusColor,
  t,
} from "@/src/core/utils";
import { useHomeNavigation } from "@/src/features/home-deadline-list/hooks/use-home-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { auth } from "@/src/firebase";
import type { Deadline } from "@/src/models/deadline";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, radius, spacing, typography } from "@/src/theme";

type HomeFilter = "all" | "overdue" | "urgent" | "soon" | "onTrack";
type DeadlineListRow = { id: string; item: Deadline; isOverdue: boolean };

function isSameCalendarDay(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function statusLabelFromItem(item: Deadline, isOverdue: boolean): string {
  const status = getDeadlineStatus(item.dueAt);

  if (isOverdue) {
    return t("overdue");
  }

  if (status === "urgent") {
    return t("filterUrgent");
  }

  if (status === "soon") {
    return t("filterSoon");
  }

  return t("onTrack");
}

function statusColorFromItem(
  item: Deadline,
  isOverdue: boolean,
): "red" | "yellow" | "green" | "gray" {
  const status = getDeadlineStatus(item.dueAt);

  if (isOverdue) {
    return "gray";
  }

  return getDeadlineStatusColor(status);
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
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);
  const isLoadingDeadlines = useDeadlineStore(
    (state) => state.isLoadingDeadlines,
  );
  const completeDeadline = useDeadlineStore((state) => state.completeDeadline);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        return;
      }

      void loadDeadlines();
    });

    return unsubscribe;
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

  const dueTodayCount = deadlines.filter((item) =>
    isSameCalendarDay(item.dueAt),
  ).length;
  const urgentCount = deadlines.filter(
    (item) => getDeadlineStatus(item.dueAt) === "urgent",
  ).length;
  const activeFilteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return deadlines.filter((item) => {
      if (!normalized) {
        return true;
      }

      return (
        item.assignmentName.toLowerCase().includes(normalized) ||
        item.courseName.toLowerCase().includes(normalized)
      );
    });
  }, [deadlines, search]);

  // Get filtered list based on selected filter
  const filteredItems = useMemo<Deadline[]>(() => {
    if (filter === "overdue") {
      return activeFilteredItems.filter(
        (item) => getDeadlineStatus(item.dueAt) === "overdue",
      );
    }

    if (filter === "urgent") {
      return activeFilteredItems.filter(
        (item) => getDeadlineStatus(item.dueAt) === "urgent",
      );
    }

    if (filter === "soon") {
      return activeFilteredItems.filter(
        (item) => getDeadlineStatus(item.dueAt) === "soon",
      );
    }

    if (filter === "onTrack") {
      return activeFilteredItems.filter(
        (item) => getDeadlineStatus(item.dueAt) === "onTrack",
      );
    }

    return activeFilteredItems;
  }, [activeFilteredItems, filter]);

  const listRows = useMemo<DeadlineListRow[]>(() => {
    return filteredItems.map((item) => ({
      id: `item-${item.id}`,
      item,
      isOverdue: getDeadlineStatus(item.dueAt) === "overdue",
    }));
  }, [filteredItems]);

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
        </Card>

        <View style={styles.filterRow}>
          {[
            { key: "all", label: t("filterAll") },
            { key: "overdue", label: t("overdue") },
            { key: "urgent", label: t("filterUrgent") },
            { key: "soon", label: t("filterSoon") },
            { key: "onTrack", label: t("onTrack") },
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
          {!search && !isSearchFocused ? (
            <AppText variant="caption" style={styles.searchPlaceholderText}>
              {t("searchDeadlinePlaceholder")}
            </AppText>
          ) : null}
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel={t("searchDeadlinePlaceholder")}
          />
        </View>

        <View style={styles.listSection}>
          {isLoadingDeadlines ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primaryStrong} />
              <AppText variant="caption" style={styles.loadingText}>
                {t("loadingDeadlines")}
              </AppText>
            </View>
          ) : (
            <>
              <FlatList
                data={listRows}
                keyExtractor={(row) => row.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingDeadlines}
                    onRefresh={() => {
                      if (!auth.currentUser) {
                        return;
                      }

                      void loadDeadlines();
                    }}
                    tintColor={colors.primaryStrong}
                  />
                }
                renderItem={({ item: row }) => {
                  const item = row.item;
                  const isOverdue = row.isOverdue;
                  return (
                    <View style={styles.cardWrapper}>
                      <DeadlineCard
                        assignmentName={item.assignmentName}
                        courseName={item.courseName}
                        dueLabel={`${t("duePrefix")} ${formatDueLabel(item.dueAt)} • ${statusLabelFromItem(item, isOverdue)}`}
                        urgencyColor={statusColorFromItem(item, isOverdue)}
                        actionLabel={t("done")}
                        onPressAction={() => onDone(item.id)}
                        onPressCard={() => {
                          navigation.navigate(StackRoutes.DeadlineDetail, {
                            id: item.id,
                          });
                        }}
                        cardAccessibilityLabel={`${item.assignmentName}, ${t("due")} ${formatDueLabel(item.dueAt)}`}
                      />
                    </View>
                  );
                }}
                ListEmptyComponent={null}
              />
            </>
          )}
        </View>

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
  searchWrap: {
    marginTop: spacing.l,
    marginBottom: spacing.xl,
    position: "relative",
    justifyContent: "center",
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
  searchPlaceholderText: {
    position: "absolute",
    left: spacing.l,
    zIndex: 1,
    color: colors.textMuted,
    fontSize: typography.size.s,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xs,
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
  listSection: {
    flex: 1,
    gap: spacing.s,
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  listSectionTitle: {
    paddingHorizontal: spacing.s,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.2,
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
    gap: spacing.s,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  emptyCard: {
    marginTop: spacing.xxxl,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    textAlign: "center",
    color: colors.textSecondary,
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
  overdueCard: {
    marginBottom: spacing.m,
    borderColor: colors.border,
    backgroundColor: colors.surfacePink,
    gap: spacing.xs,
  },
  overdueTitle: {
    color: colors.warning,
  },
  overdueHint: {
    color: colors.textSecondary,
  },
  errorCard: {
    marginBottom: spacing.m,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
  },
  errorHint: {
    color: colors.textSecondary,
  },
  errorActionWrap: {
    marginTop: spacing.s,
  },
});
