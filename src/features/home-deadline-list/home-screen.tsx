import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
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
  t,
} from "@/src/core/utils";
import { useHomeNavigation } from "@/src/features/home-deadline-list/hooks/use-home-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { auth } from "@/src/firebase";
import type { Deadline } from "@/src/models/deadline";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  radius,
  screenSharedTokens,
  spacing,
  typography,
} from "@/src/theme";
import {
  homeDeadlineListTokens,
  homeDeadlineStatusGradients,
} from "@/src/theme/tokens";

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
): "red" | "orange" | "yellow" | "green" {
  const status = getDeadlineStatus(item.dueAt);

  return isOverdue
    ? getDeadlineStatusDisplayColor("overdue")
    : getDeadlineStatusDisplayColor(status);
}

function getGradientColorsFromItem(
  item: Deadline,
  isOverdue: boolean,
): readonly [string, string] {
  const status = isOverdue ? "overdue" : getDeadlineStatus(item.dueAt);

  switch (status) {
    case "overdue":
      return homeDeadlineStatusGradients.overdue;
    case "urgent":
      return homeDeadlineStatusGradients.urgent;
    case "soon":
      return homeDeadlineStatusGradients.soon;
    case "onTrack":
      return homeDeadlineStatusGradients.onTrack;
    default:
      return homeDeadlineStatusGradients.default;
  }
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
          size={homeDeadlineListTokens.swipeActionIconSize}
          color={colors.buttonText}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {t("done")}
        </AppText>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.editAction]}
        onPress={onEdit}
      >
        <Ionicons
          name="create-outline"
          size={homeDeadlineListTokens.swipeActionIconSize}
          color={colors.buttonText}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {t("edit")}
        </AppText>
      </Pressable>
      <Pressable
        style={[styles.swipeActionBtn, styles.deleteAction]}
        onPress={onDelete}
      >
        <Ionicons
          name="trash-outline"
          size={homeDeadlineListTokens.swipeActionIconSize}
          color={colors.buttonText}
        />
        <AppText variant="caption" style={styles.swipeActionText}>
          {t("delete")}
        </AppText>
      </Pressable>
    </View>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < screenSharedTokens.compactWidthThreshold;
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
  const heroGlow = useRef(
    new Animated.Value(homeDeadlineListTokens.heroGlowMinOpacity),
  ).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroGlow, {
          toValue: homeDeadlineListTokens.heroGlowMaxOpacity,
          duration: homeDeadlineListTokens.heroGlowPulseDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(heroGlow, {
          toValue: homeDeadlineListTokens.heroGlowMinOpacity,
          duration: homeDeadlineListTokens.heroGlowPulseDurationMs,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [heroGlow]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onDone = (id: string) => {
    completeDeadline(id);
    setToastMessage(t("movedToHistory"));
    setShowToast(true);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, homeDeadlineListTokens.toastDurationMs);
  };

  const onDelete = (id: string) => {
    Alert.alert(t("deleteDeadlineTitle"), t("deleteDeadlineConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          void deleteDeadline(id);
        },
      },
    ]);
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
      <Animated.View style={[styles.heroOrb, { opacity: heroGlow }]} />
      <View style={styles.violetOrb} />

      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <View style={styles.headerRow}>
          <AppText variant="title" style={styles.headerTitle}>
            {t("myDeadlines")}
          </AppText>
        </View>

        <BlurView
          intensity={homeDeadlineListTokens.summaryBlurIntensity}
          tint="light"
          style={styles.summaryGlass}
        >
          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, styles.summaryItemCoral]}>
              <AppText variant="caption" style={styles.summaryLabelCoral}>
                {t("overdue")}
              </AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(overdueCount)}
              </AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryItem, styles.summaryItemViolet]}>
              <AppText variant="caption" style={styles.summaryLabelViolet}>
                {t("summaryDueToday")}
              </AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(dueTodayCount)}
              </AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryItem, styles.summaryItemAmber]}>
              <AppText variant="caption" style={styles.summaryLabelAmber}>
                {t("summaryUrgent")}
              </AppText>
              <AppText variant="sectionTitle" style={styles.summaryValue}>
                {String(urgentCount)}
              </AppText>
            </View>
          </View>
        </BlurView>

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

        <BlurView
          intensity={homeDeadlineListTokens.searchBlurIntensity}
          tint="light"
          style={styles.searchWrap}
        >
          <Ionicons
            name="search-outline"
            size={homeDeadlineListTokens.searchIconSize}
            color={homeDeadlineListTokens.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={isSearchFocused ? "" : t("searchDeadlinePlaceholder")}
            placeholderTextColor={homeDeadlineListTokens.searchPlaceholder}
            style={styles.searchInput}
            accessibilityLabel={t("searchDeadlinePlaceholder")}
          />
        </BlurView>

        <View style={styles.listSection}>
          {isLoadingDeadlines ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primaryStrong} />
              <AppText variant="caption" style={styles.loadingText}>
                {t("loadingDeadlines")}
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
                  tintColor={colors.primaryStrong}
                />
              }
              renderItem={({ item: row }) => {
                const item = row.item;
                const isOverdue = row.isOverdue;
                const cardGradients = getGradientColorsFromItem(
                  item,
                  isOverdue,
                );

                return (
                  <Swipeable
                    friction={homeDeadlineListTokens.swipeableFriction}
                    rightThreshold={
                      homeDeadlineListTokens.swipeableRightThreshold
                    }
                    overshootRight={false}
                    renderRightActions={() => (
                      <SwipeActions
                        onDone={() => onDone(item.id)}
                        onEdit={() => {
                          navigation.navigate(StackRoutes.MainTabs, {
                            screen: TabRoutes.AddDeadline,
                            params: { mode: "edit", id: item.id },
                          });
                        }}
                        onDelete={() => onDelete(item.id)}
                      />
                    )}
                  >
                    <View style={styles.cardWrapper}>
                      <DeadlineCard
                        assignmentName={item.assignmentName}
                        courseName={item.courseName}
                        dueLabel={`${t("duePrefix")} ${formatDueLabel(item.dueAt)}`}
                        statusLabel={statusLabelFromItem(item, isOverdue)}
                        urgencyColor={statusColorFromItem(item, isOverdue)}
                        gradientColors={cardGradients}
                        onPressCard={() => {
                          navigation.navigate(StackRoutes.DeadlineDetail, {
                            id: item.id,
                          });
                        }}
                        cardAccessibilityLabel={`${item.assignmentName}, ${t("due")} ${formatDueLabel(item.dueAt)}`}
                      />
                    </View>
                  </Swipeable>
                );
              }}
              ListEmptyComponent={
                <BlurView
                  intensity={homeDeadlineListTokens.emptyStateBlurIntensity}
                  tint="light"
                  style={styles.emptyStateCard}
                >
                  <AppText
                    variant="sectionTitle"
                    style={styles.emptyStateTitle}
                  >
                    {filter === "all"
                      ? t("allCaughtUp")
                      : t("noTasksInCategoryYet")}
                  </AppText>
                  <AppText variant="caption" style={styles.emptyStateHint}>
                    {filter === "all"
                      ? t("homeEmptyHint")
                      : t("searchDeadlinePlaceholder")}
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
    backgroundColor: homeDeadlineListTokens.safeAreaBackground,
  },
  heroOrb: {
    position: "absolute",
    width: homeDeadlineListTokens.heroOrbSize,
    height: homeDeadlineListTokens.heroOrbSize,
    borderRadius: homeDeadlineListTokens.heroOrbSize,
    right: homeDeadlineListTokens.heroOrbRight,
    top: homeDeadlineListTokens.heroOrbTop,
    backgroundColor: homeDeadlineListTokens.heroOrbBackground,
  },
  violetOrb: {
    position: "absolute",
    width: homeDeadlineListTokens.violetOrbSize,
    height: homeDeadlineListTokens.violetOrbSize,
    borderRadius: homeDeadlineListTokens.violetOrbSize,
    left: homeDeadlineListTokens.violetOrbLeft,
    top: homeDeadlineListTokens.violetOrbTop,
    backgroundColor: homeDeadlineListTokens.violetOrbBackground,
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
    marginBottom: spacing.s,
  },
  headerTitle: {
    color: homeDeadlineListTokens.titleColor,
    fontSize: typography.size.xl,
    lineHeight: screenSharedTokens.screenTitleLineHeight,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
  },
  summaryGlass: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: homeDeadlineListTokens.summaryBorder,
    backgroundColor: homeDeadlineListTokens.summaryBackground,
    marginBottom: spacing.m,
    shadowColor: homeDeadlineListTokens.summaryShadow,
    shadowOpacity: homeDeadlineListTokens.summaryShadowOpacity,
    shadowRadius: homeDeadlineListTokens.summaryShadowRadius,
    shadowOffset: {
      width: 0,
      height: homeDeadlineListTokens.summaryShadowOffsetY,
    },
    elevation: homeDeadlineListTokens.summaryShadowElevation,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeDeadlineListTokens.summaryItemGap,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  summaryItem: {
    flex: 1,
    height: homeDeadlineListTokens.summaryDividerHeight,
    gap: spacing.xxs,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryItemCoral: {
    backgroundColor: homeDeadlineListTokens.summaryItemBackground,
  },
  summaryItemViolet: {
    backgroundColor: homeDeadlineListTokens.summaryItemBackground,
  },
  summaryItemAmber: {
    backgroundColor: homeDeadlineListTokens.summaryItemBackground,
  },
  summaryDivider: {
    width: homeDeadlineListTokens.summaryDividerWidth,
    height: homeDeadlineListTokens.summaryDividerHeight,
    backgroundColor: homeDeadlineListTokens.summaryDivider,
  },
  summaryValue: {
    color: homeDeadlineListTokens.titleColor,
    lineHeight: homeDeadlineListTokens.summaryValueLineHeight,
    fontSize: typography.size.section,
    textAlign: "center",
  },
  summaryLabelCoral: {
    color: homeDeadlineListTokens.titleColor,
    textAlign: "center",
  },
  summaryLabelViolet: {
    color: homeDeadlineListTokens.titleColor,
    textAlign: "center",
  },
  summaryLabelAmber: {
    color: homeDeadlineListTokens.titleColor,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: homeDeadlineListTokens.filterChipRowGap,
    marginBottom: spacing.m,
  },
  filterChip: {
    flex: 1,
    minHeight: homeDeadlineListTokens.filterChipMinHeight,
    paddingHorizontal: homeDeadlineListTokens.filterChipHorizontalPadding,
    paddingVertical: homeDeadlineListTokens.filterChipVerticalPadding,
    borderRadius: homeDeadlineListTokens.filterChipBorderRadius,
    borderWidth: homeDeadlineListTokens.filterChipBorderWidth,
    borderColor: homeDeadlineListTokens.filterChipBorder,
    backgroundColor: homeDeadlineListTokens.filterChipBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.chipBgActive,
    borderColor: colors.border,
  },
  filterChipText: {
    color: homeDeadlineListTokens.titleColor,
    fontFamily: typography.family.medium,
    fontSize: homeDeadlineListTokens.filterChipTextSize,
    lineHeight: homeDeadlineListTokens.filterChipTextLineHeight,
  },
  filterChipTextActive: {
    color: homeDeadlineListTokens.titleColor,
  },
  searchWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.m,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: homeDeadlineListTokens.searchBorder,
    backgroundColor: homeDeadlineListTokens.searchBackground,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    minHeight: homeDeadlineListTokens.searchMinHeight,
  },
  searchInput: {
    flex: 1,
    color: homeDeadlineListTokens.titleColor,
    marginLeft: spacing.m,
    fontSize: homeDeadlineListTokens.searchInputSize,
    fontFamily: typography.family.regular,
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
    color: homeDeadlineListTokens.titleColor,
  },
  listContent: {
    paddingBottom:
      spacing.xxxxl + homeDeadlineListTokens.listBottomPaddingExtra,
    gap: spacing.m,
  },
  cardWrapper: {
    marginBottom: spacing.s,
    borderWidth: homeDeadlineListTokens.cardWrapperBorderWidth,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    padding: homeDeadlineListTokens.cardWrapperPadding,
    overflow: "hidden",
  },
  emptyStateCard: {
    marginTop: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeDeadlineListTokens.emptyCardBorder,
    backgroundColor: homeDeadlineListTokens.emptyCardBackground,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.s,
  },
  emptyStateTitle: {
    textAlign: "center",
    color: homeDeadlineListTokens.titleColor,
  },
  emptyStateHint: {
    textAlign: "center",
    color: homeDeadlineListTokens.titleColor,
  },
  swipeActionsWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: spacing.m,
    borderRadius: radius.xxl,
    overflow: "hidden",
  },
  swipeActionBtn: {
    width: homeDeadlineListTokens.swipeActionWidth,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xxs,
  },
  swipeActionText: {
    color: colors.buttonText,
    fontFamily: typography.family.semibold,
  },
  doneAction: {
    backgroundColor: homeDeadlineListTokens.doneActionBackground,
  },
  editAction: {
    backgroundColor: homeDeadlineListTokens.editActionBackground,
  },
  deleteAction: {
    backgroundColor: homeDeadlineListTokens.deleteActionBackground,
  },
});
