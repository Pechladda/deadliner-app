import { AppIcon } from "@/src/components";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, PastelBackground, Toast } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation/route-names";
import {
  formatDueLabel,
  getDeadlineStatus,
  getDeadlineStatusDisplayColor,
} from "@/src/core/utils";
import { useHomeNavigation } from "@/src/features/home-deadline-list/hooks/use-home-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { auth } from "@/src/firebase";
import type { Deadline } from "@/src/models/deadline";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  constants,
  layout,
  radius,
  shadows,
  spacing,
  typography,
} from "@/src/theme";

const BRAND_PINK = "#EAB8C9";
const BRAND_PINK_LIGHT = "#F5DDE6";
const BRAND_PINK_MUTED = "#F0C9D6";
const SEARCH_FOCUS_TINT = BRAND_PINK_LIGHT + "33";
const FILTER_INACTIVE_TINT = BRAND_PINK_LIGHT + "55";
const WHITE = "#fff";
const SWIPE_DONE_COLOR = "#A8D5B5";
const SWIPE_DELETE_COLOR = "#E8A0A0";

const SUMMARY_BLUR_INTENSITY = 26;
const EMPTY_STATE_BLUR_INTENSITY = 26;
const EMPTY_STATE_ICON_SIZE = 32;
const FILTER_CHIP_ICON_SIZE = 11;
const SEARCH_ICON_SIZE = 15;
const SEARCH_CLEAR_ICON_SIZE = 16;
const SECTION_LABEL_ICON_SIZE = 13;
const SEARCH_CLEAR_HIT_SLOP = 8;

type HomeFilter = "all" | "overdue" | "urgent" | "soon" | "onTrack";
type DeadlineListRow = { id: string; item: Deadline; isOverdue: boolean };
type UrgencyColor = "red" | "orange" | "yellow" | "green";

const FILTER_STATUS_MAP: Partial<Record<HomeFilter, string>> = {
  overdue: "overdue",
  urgent: "urgent",
  soon: "soon",
  onTrack: "onTrack",
};

const FILTER_OPTIONS: {
  key: HomeFilter;
  label: string;
  icon: string;
}[] = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "overdue", label: "Overdue", icon: "alert-circle-outline" },
  { key: "urgent", label: "Urgent", icon: "flame-outline" },
  { key: "soon", label: "Soon", icon: "time-outline" },
  { key: "onTrack", label: "On Track", icon: "checkmark-circle-outline" },
];

function isSameCalendarDay(isoDate: string): boolean {
  const date = new Date(isoDate);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function hasDueDate(deadline: Deadline): boolean {
  return Boolean(deadline.dueAt);
}

function resolveStatusLabel(
  deadline: Deadline,
  isOverdue: boolean,
): string | undefined {
  if (!hasDueDate(deadline)) return undefined;
  if (isOverdue) return "Overdue";
  const status = getDeadlineStatus(deadline.dueAt);
  if (status === "urgent") return "Urgent";
  if (status === "soon") return "Soon";
  return "On Track";
}

function resolveUrgencyColor(
  deadline: Deadline,
  isOverdue: boolean,
): UrgencyColor {
  if (!hasDueDate(deadline)) return "green";
  if (isOverdue) return getDeadlineStatusDisplayColor("overdue");
  return getDeadlineStatusDisplayColor(getDeadlineStatus(deadline.dueAt));
}

function countDeadlinesWithStatus(
  deadlines: Deadline[],
  status: string,
): number {
  return deadlines.filter(
    (deadline) =>
      hasDueDate(deadline) && getDeadlineStatus(deadline.dueAt) === status,
  ).length;
}

type FilterChipProps = {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
};

function FilterChip({ label, icon, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <AppIcon
        name={icon}
        size={FILTER_CHIP_ICON_SIZE}
        color={active ? WHITE : BRAND_PINK}
        style={styles.filterChipIcon}
      />
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

type SummaryStatProps = {
  value: number;
  label: string;
};

function SummaryStat({ value, label }: SummaryStatProps) {
  return (
    <View style={styles.summaryItem}>
      <AppText style={styles.summaryValue}>{String(value)}</AppText>
      <AppText style={styles.summaryLabel}>{label}</AppText>
    </View>
  );
}

type SwipeActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  onDone: () => void;
};

function SwipeActions({ onEdit, onDelete, onDone }: SwipeActionsProps) {
  const iconSize = layout.components.home.swipeActionIconSize;
  return (
    <View style={styles.swipeActionsWrap}>
      <Pressable
        style={[styles.swipeActionBtn, styles.doneAction]}
        onPress={onDone}
      >
        <View style={styles.swipeActionInner}>
          <AppIcon name="checkmark-circle" size={iconSize} color={WHITE} />
          <AppText variant="caption" style={styles.swipeActionText}>
            {"Done"}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.editAction]}
        onPress={onEdit}
      >
        <View style={styles.swipeActionInner}>
          <AppIcon name="pencil" size={iconSize} color={WHITE} />
          <AppText variant="caption" style={styles.swipeActionText}>
            {"Edit"}
          </AppText>
        </View>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.deleteAction]}
        onPress={onDelete}
      >
        <View style={styles.swipeActionInner}>
          <AppIcon name="trash" size={iconSize} color={WHITE} />
          <AppText variant="caption" style={styles.swipeActionText}>
            {"Delete"}
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

type DeadlineListItemProps = {
  row: DeadlineListRow;
  onDone: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPressCard: (id: string) => void;
};

function DeadlineListItem({
  row,
  onDone,
  onEdit,
  onDelete,
  onPressCard,
}: DeadlineListItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const { item: deadline, isOverdue } = row;

  const dueLabel = deadline.dueAt
    ? `Due: ${formatDueLabel(deadline.dueAt)}`
    : "";

  const closeAndRun = (callback: (id: string) => void) => {
    swipeableRef.current?.close();
    callback(deadline.id);
  };

  const card = (
    <View style={styles.cardWrapper}>
      <DeadlineCard
        assignmentName={deadline.assignmentName}
        courseName={deadline.courseName}
        dueLabel={dueLabel}
        statusLabel={resolveStatusLabel(deadline, isOverdue)}
        urgencyColor={resolveUrgencyColor(deadline, isOverdue)}
        onPressCard={() => onPressCard(deadline.id)}
      />
    </View>
  );

  if (Platform.OS === "web") {
    return card;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={constants.home.swipeableFriction}
      rightThreshold={constants.home.swipeableRightThreshold}
      overshootRight={false}
      renderRightActions={() => (
        <SwipeActions
          onDone={() => closeAndRun(onDone)}
          onEdit={() => closeAndRun(onEdit)}
          onDelete={() => closeAndRun(onDelete)}
        />
      )}
    >
      {card}
    </Swipeable>
  );
}

export function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const navigation = useHomeNavigation();
  const deadlines = useDeadlineStore((state) => state.deadlines);
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);
  const isLoadingDeadlines = useDeadlineStore(
    (state) => state.isLoadingDeadlines,
  );
  const completeDeadline = useDeadlineStore((state) => state.completeDeadline);
  const deleteDeadline = useDeadlineStore((state) => state.deleteDeadline);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<HomeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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

  const handleMarkAsDone = (id: string) => {
    completeDeadline(id);
    setToastMessage("Moved to History");
    setIsToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, constants.home.toastDurationMs);
  };

  const handleDeleteWithConfirm = (id: string) => {
    Alert.alert(
      "Delete deadline",
      "Are you sure you want to delete this assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteDeadline(id);
          },
        },
      ],
    );
  };

  const dueTodayCount = deadlines.filter(
    (deadline) =>
      hasDueDate(deadline) && isSameCalendarDay(deadline.dueAt),
  ).length;
  const overdueCount = countDeadlinesWithStatus(deadlines, "overdue");
  const urgentCount = countDeadlinesWithStatus(deadlines, "urgent");

  const searchFilteredDeadlines = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return deadlines;
    return deadlines.filter((deadline) => {
      const matchesAssignment = deadline.assignmentName
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesCourse = deadline.courseName
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesAssignment || matchesCourse;
    });
  }, [deadlines, searchQuery]);

  const visibleDeadlines = useMemo<Deadline[]>(() => {
    const requiredStatus = FILTER_STATUS_MAP[activeFilter];
    if (!requiredStatus) return searchFilteredDeadlines;
    return searchFilteredDeadlines.filter(
      (deadline) =>
        hasDueDate(deadline) &&
        getDeadlineStatus(deadline.dueAt) === requiredStatus,
    );
  }, [searchFilteredDeadlines, activeFilter]);

  const listRows = useMemo<DeadlineListRow[]>(
    () =>
      visibleDeadlines.map((deadline) => ({
        id: `item-${deadline.id}`,
        item: deadline,
        isOverdue:
          hasDueDate(deadline) &&
          getDeadlineStatus(deadline.dueAt) === "overdue",
      })),
    [visibleDeadlines],
  );

  const totalCount = deadlines.length;
  const totalCountLabel =
    totalCount === 0
      ? "Nothing here yet ✨"
      : `${totalCount} task${totalCount !== 1 ? "s" : ""} total`;
  const visibleCountLabel =
    listRows.length === 0
      ? "No tasks found"
      : `${listRows.length} task${listRows.length !== 1 ? "s" : ""}`;

  const handleEditNavigate = (id: string) => {
    navigation.navigate(StackRoutes.MainTabs, {
      screen: TabRoutes.AddDeadline,
      params: { mode: "edit", id },
    });
  };

  const handleDetailNavigate = (id: string) => {
    navigation.navigate(StackRoutes.DeadlineDetail, { id });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />

      <View
        style={[styles.container, isCompactLayout && styles.containerCompact]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerTextBlock}>
              <AppText variant="section" style={styles.headerTitle}>
                {"My Deadlines"}
              </AppText>
              <AppText style={styles.headerSubtitle}>{totalCountLabel}</AppText>
            </View>
          </View>
        </View>

        <BlurView
          intensity={SUMMARY_BLUR_INTENSITY}
          tint="light"
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <SummaryStat value={overdueCount} label="Overdue" />
            <View style={styles.summaryDivider} />
            <SummaryStat value={dueTodayCount} label="Due today" />
            <View style={styles.summaryDivider} />
            <SummaryStat value={urgentCount} label="Urgent" />
          </View>
        </BlurView>

        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((option) => (
            <FilterChip
              key={option.key}
              label={option.label}
              icon={option.icon}
              active={activeFilter === option.key}
              onPress={() => setActiveFilter(option.key)}
            />
          ))}
        </View>

        <View
          style={[
            styles.searchWrap,
            isSearchFocused && styles.searchWrapFocused,
          ]}
        >
          <AppIcon
            name="search"
            size={SEARCH_ICON_SIZE}
            color={isSearchFocused ? BRAND_PINK : colors.textSecondary}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={
              isSearchFocused ? "" : "Search by assignment or course"
            }
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            accessibilityLabel="Search by assignment or course"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              hitSlop={SEARCH_CLEAR_HIT_SLOP}
            >
              <AppIcon
                name="close-circle"
                size={SEARCH_CLEAR_ICON_SIZE}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {!isLoadingDeadlines && (
          <View style={styles.sectionLabelRow}>
            <AppIcon
              name="list"
              size={SECTION_LABEL_ICON_SIZE}
              color={colors.textSecondary}
            />
            <AppText style={styles.sectionLabel}>{visibleCountLabel}</AppText>
          </View>
        )}

        <View style={styles.listSection}>
          {isLoadingDeadlines ? (
            <View style={styles.loadingWrap}>
              <View style={styles.loadingIconWrap}>
                <ActivityIndicator color={BRAND_PINK} size="small" />
              </View>
              <AppText variant="caption" style={styles.loadingText}>
                {"Loading your deadlines..."}
              </AppText>
            </View>
          ) : (
            <FlatList
              data={listRows}
              keyExtractor={(row) => row.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingDeadlines}
                  onRefresh={() => {
                    if (!auth.currentUser) return;
                    void loadDeadlines();
                  }}
                  tintColor={BRAND_PINK}
                />
              }
              renderItem={({ item: row }) => (
                <DeadlineListItem
                  row={row}
                  onDone={handleMarkAsDone}
                  onEdit={handleEditNavigate}
                  onDelete={handleDeleteWithConfirm}
                  onPressCard={handleDetailNavigate}
                />
              )}
              ListEmptyComponent={
                <BlurView
                  intensity={EMPTY_STATE_BLUR_INTENSITY}
                  tint="light"
                  style={styles.emptyStateCard}
                >
                  <AppIcon
                    name={
                      activeFilter === "all"
                        ? "sparkles-outline"
                        : "filter-outline"
                    }
                    size={EMPTY_STATE_ICON_SIZE}
                    color={BRAND_PINK}
                  />
                  <AppText variant="section" style={styles.emptyStateTitle}>
                    {activeFilter === "all"
                      ? "You're all caught up."
                      : "No tasks in this category yet."}
                  </AppText>
                  <AppText variant="caption" style={styles.emptyStateHint}>
                    {activeFilter === "all"
                      ? "Create your first deadline and stay ahead."
                      : "Try a different filter or add a new deadline."}
                  </AppText>
                </BlurView>
              }
            />
          )}
        </View>

        <Toast message={toastMessage} visible={isToastVisible} type="success" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
  },
  containerCompact: {
    paddingHorizontal: spacing.s,
    paddingTop: spacing.s,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  headerTextBlock: {
    marginLeft: 8,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    marginTop: 1,
  },
  summaryCard: {
    borderRadius: radius.m,
    overflow: "hidden",
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    marginBottom: spacing.m,
    ...shadows.shadowCard,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
    opacity: 0.4,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.size.l,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.m,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    letterSpacing: constants.typography.letterSpacing.tight,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: BRAND_PINK_MUTED,
    backgroundColor: FILTER_INACTIVE_TINT,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  filterChipActive: {
    backgroundColor: BRAND_PINK,
    borderColor: BRAND_PINK,
  },
  filterChipIcon: {
    marginRight: 1,
  },
  filterChipText: {
    color: BRAND_PINK,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.xs,
    textAlign: "center",
  },
  filterChipTextActive: {
    color: WHITE,
    fontWeight: typography.weight.bold,
  },
  searchWrap: {
    minHeight: 46,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.s,
    overflow: "hidden",
  },
  searchWrapFocused: {
    borderColor: BRAND_PINK,
    backgroundColor: SEARCH_FOCUS_TINT,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    paddingVertical: spacing.s,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: spacing.s,
    paddingLeft: 2,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    letterSpacing: constants.typography.letterSpacing.tight,
  },
  listSection: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.s,
  },
  loadingIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: BRAND_PINK_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.s,
  },
  cardWrapper: {
    borderRadius: radius.s,
    overflow: "hidden",
  },
  emptyStateCard: {
    borderRadius: radius.m,
    overflow: "hidden",
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.m,
    marginTop: spacing.l,
    ...shadows.shadowCard,
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
  swipeActionsWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radius.s,
    overflow: "hidden",
    marginLeft: spacing.s,
    gap: 2,
  },
  swipeActionBtn: {
    width: 68,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeActionInner: {
    alignItems: "center",
    gap: 4,
  },
  swipeActionText: {
    color: WHITE,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.xs,
  },
  doneAction: {
    backgroundColor: SWIPE_DONE_COLOR,
  },
  editAction: {
    backgroundColor: BRAND_PINK_MUTED,
  },
  deleteAction: {
    backgroundColor: SWIPE_DELETE_COLOR,
  },
});
