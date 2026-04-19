import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View
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
  spacing,
  typography
} from "@/src/theme";

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
    return "Overdue";
  }

  if (status === "urgent") {
    return "Urgent";
  }

  if (status === "soon") {
    return "Soon";
  }

  return "On Track";
}

function statusColorFromItem(
  item: Deadline,
  isOverdue: boolean,
): "red" | "orange" | "yellow" | "green" {
  const status = getDeadlineStatus(item.dueAt);

  return isOverdue
    ? getDeadlineStatusDisplayColor("overdue")
    : getDeadlineStatusDisplayColor(status);
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

type SwipeActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  onDone: () => void;
};

function SwipeActions({ onEdit, onDelete, onDone }: SwipeActionsProps) {
  return (
    <View style={styles.swipeActionsWrap}>
      <Pressable
        style={[styles.swipeActionBtn, styles.doneAction]}
        onPress={onDone}
      >
        <Ionicons
          name="checkmark"
          size={layout.components.home.swipeActionIconSize}
          color={colors.background}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {"Done"}
        </AppText>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.editAction]}
        onPress={onEdit}
      >
        <Ionicons
          name="create-outline"
          size={layout.components.home.swipeActionIconSize}
          color={colors.background}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {"Edit"}
        </AppText>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.deleteAction]}
        onPress={onDelete}
      >
        <Ionicons
          name="trash-outline"
          size={layout.components.home.swipeActionIconSize}
          color={colors.background}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {"Delete"}
        </AppText>
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
  const item = row.item;
  const isOverdue = row.isOverdue;

  return (
    <Swipeable
      ref={swipeableRef}
      friction={constants.home.swipeableFriction}
      rightThreshold={constants.home.swipeableRightThreshold}
      overshootRight={false}
      renderRightActions={() => (
        <SwipeActions
          onDone={() => {
            swipeableRef.current?.close();
            onDone(item.id);
          }}
          onEdit={() => {
            swipeableRef.current?.close();
            onEdit(item.id);
          }}
          onDelete={() => {
            swipeableRef.current?.close();
            onDelete(item.id);
          }}
        />
      )}
    >
      <View style={styles.cardWrapper}>
        <DeadlineCard
          assignmentName={item.assignmentName}
          courseName={item.courseName}
          dueLabel={`${"Due:"} ${formatDueLabel(item.dueAt)}`}
          statusLabel={statusLabelFromItem(item, isOverdue)}
          urgencyColor={statusColorFromItem(item, isOverdue)}
          onPressCard={() => onPressCard(item.id)}
        />
      </View>
    </Swipeable>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < layout.thresholds.compact;
  const navigation = useHomeNavigation();
  const deadlines = useDeadlineStore((state) => state.deadlines);
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);
  const isLoadingDeadlines = useDeadlineStore(
    (state) => state.isLoadingDeadlines,
  );
  const completeDeadline = useDeadlineStore((state) => state.completeDeadline);
  const deleteDeadline = useDeadlineStore((state) => state.deleteDeadline);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
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

  const onDone = (id: string) => {
    completeDeadline(id);
    setToastMessage("Moved to History");
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, constants.home.toastDurationMs);
  };

  const onDelete = (id: string) => {
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

  const dueTodayCount = deadlines.filter((item) =>
    isSameCalendarDay(item.dueAt),
  ).length;
  const overdueCount = deadlines.filter(
    (item) => getDeadlineStatus(item.dueAt) === "overdue",
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
      <PastelBackground />

      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <View style={styles.headerRow}>
          <AppText variant="section" style={styles.headerTitle}>
            {"My Deadlines"}
          </AppText>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, styles.summaryItemCoral]}>
            <AppText variant="caption" style={styles.summaryLabelCoral}>
              {"Overdue"}
            </AppText>
            <AppText variant="section" style={styles.summaryValue}>
              {String(overdueCount)}
            </AppText>
          </View>
          <View style={[styles.summaryItem, styles.summaryItemViolet]}>
            <AppText variant="caption" style={styles.summaryLabelViolet}>
              {"Due today"}
            </AppText>
            <AppText variant="section" style={styles.summaryValue}>
              {String(dueTodayCount)}
            </AppText>
          </View>
          <View style={[styles.summaryItem, styles.summaryItemAmber]}>
            <AppText variant="caption" style={styles.summaryLabelAmber}>
              {"Urgent"}
            </AppText>
            <AppText variant="section" style={styles.summaryValue}>
              {String(urgentCount)}
            </AppText>
          </View>
        </View>

        <View style={styles.filterRow}>
          {[
            { key: "all", label: "All" },
            { key: "overdue", label: "Overdue" },
            { key: "urgent", label: "Urgent" },
            { key: "soon", label: "Soon" },
            { key: "onTrack", label: "On Track" },
          ].map((item) => (
            <FilterChip
              key={item.key}
              label={item.label}
              active={filter === item.key}
              onPress={() => setFilter(item.key as HomeFilter)}
            />
          ))}
        </View>

        <BlurView
          intensity={constants.home.searchBlurIntensity}
          tint="light"
          style={styles.searchWrap}
        >
          <Ionicons
            name="search-outline"
            size={constants.home.searchIconSize}
            color={colors.textSecondary}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={
              isSearchFocused ? "" : "Search by assignment or course"
            }
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            accessibilityLabel={"Search by assignment or course"}
          />
        </BlurView>

        <View style={styles.listSection}>
          {isLoadingDeadlines ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.borderSoft} />
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
                    if (!auth.currentUser) {
                      return;
                    }

                    void loadDeadlines();
                  }}
                  tintColor={colors.borderSoft}
                />
              }
              renderItem={({ item: row }) => (
                <DeadlineListItem
                  row={row}
                  onDone={onDone}
                  onEdit={(id) => {
                    navigation.navigate(StackRoutes.MainTabs, {
                      screen: TabRoutes.AddDeadline,
                      params: { mode: "edit", id },
                    });
                  }}
                  onDelete={onDelete}
                  onPressCard={(id) => {
                    navigation.navigate(StackRoutes.DeadlineDetail, { id });
                  }}
                />
              )}
              ListEmptyComponent={
                <BlurView
                  intensity={constants.home.emptyStateBlurIntensity}
                  tint="light"
                  style={styles.emptyStateCard}
                >
                  <AppText variant="section" style={styles.emptyStateTitle}>
                    {filter === "all"
                      ? "You're all caught up."
                      : "No tasks in this category yet."}
                  </AppText>
                  <AppText variant="caption" style={styles.emptyStateHint}>
                    {filter === "all"
                      ? "Create your first deadline and stay ahead."
                      : "Search by assignment or course"}
                  </AppText>
                </BlurView>
              }
            />
          )}
        </View>

        <Toast message={toastMessage} visible={showToast} type="success" />
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
    paddingHorizontal: spacing.l,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: spacing.s,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
    textAlign: "left",
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  summaryItem: {
    flex: 1,
    borderRadius: radius.s,
    paddingVertical: spacing.l,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    elevation: 2,
  },
  summaryItemCoral: {
    backgroundColor: colors.borderSoft,
  },
  summaryItemViolet: {
    backgroundColor: colors.borderSoft,
  },
  summaryItemAmber: {
    backgroundColor: colors.borderSoft,
  },

  summaryValue: {
    color: colors.textPrimary,
    textAlign: "center",
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.m,
  },
  summaryLabelCoral: {
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: typography.weight.semibold,
  },
  summaryLabelViolet: {
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: typography.weight.semibold,
  },
  summaryLabelAmber: {
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: typography.weight.semibold,
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  filterChip: {
    flex: 1,
    minHeight: 30,
    paddingHorizontal: 2 * 0.9,
    paddingVertical: 4 * 0.9,
    borderRadius: radius.s,
    borderWidth: 0,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.borderSoft,
    borderColor: colors.buttonBg,
    borderWidth: 1,
  },
  filterChipTextActive: {
    color: colors.textPrimary,
  },
  searchWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.l,
    borderRadius: radius.s,
    overflow: "hidden",
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: spacing.m,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
    fontSize: typography.size.xs,
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
  loadingText: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom:
      spacing.xxl,
    gap: spacing.m,
  },
  cardWrapper: {
    borderRadius: radius.s,
    padding: spacing.xs,
  },
  emptyStateCard: {
    borderRadius: radius.s,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.m,
  },
  emptyStateTitle: {
    textAlign: "center",
    color: colors.textPrimary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.sm,
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
  },
  swipeActionBtn: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.s,
  },
  swipeActionText: {
    color: "#31241F",
    fontWeight: typography.weight.semibold,
  },
  doneAction: {
    backgroundColor: colors.borderSoft,
  },
  editAction: {
    backgroundColor: colors.borderSoft,
  },
  deleteAction: {
    backgroundColor: colors.borderSoft,
  },
});