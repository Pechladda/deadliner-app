import { AppIcon } from "@/src/components";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme";

type UrgencyColor = "red" | "orange" | "yellow" | "green";
type ActionStyle = "text" | "check" | "trash";

type DeadlineCardProps = {
  assignmentName: string;
  courseName: string;
  dueLabel: string;
  statusLabel?: string;
  urgencyColor: UrgencyColor;
  completedLabel?: string;
  onPressAction?: () => void;
  onPressCard?: () => void;
  actionLabel?: string;
  actionStyle?: ActionStyle;
  muted?: boolean;
};

const BRAND_ACCENT = "#EAB8C9";

const URGENCY_TEXT_COLOR: Record<UrgencyColor, string> = {
  red: colors.overdue,
  orange: colors.urgent,
  yellow: colors.soon,
  green: colors.onTrack,
};

const URGENCY_BAR_COLOR: Record<UrgencyColor, string> = {
  red: colors.overdue,
  orange: colors.urgent,
  yellow: colors.soon,
  green: BRAND_ACCENT,
};

const CARD_MIN_HEIGHT = 64;
const ROW_ICON_SIZE = 12;
const TRASH_ICON_SIZE = 18;

export function DeadlineCard(props: DeadlineCardProps) {
  const {
    assignmentName,
    courseName,
    dueLabel,
    statusLabel,
    urgencyColor,
    completedLabel,
    onPressAction,
    onPressCard,
    actionLabel,
    actionStyle = "text",
    muted = false,
  } = props;

  return (
    <View style={[styles.card, muted && styles.cardMuted]}>
      <Pressable
        style={styles.content}
        onPress={onPressCard}
        disabled={!onPressCard}
        accessibilityRole={onPressCard ? "button" : undefined}
      >
        <View style={styles.textGroupTop}>
          <AppText
            variant="caption"
            style={styles.assignmentName}
            numberOfLines={1}
          >
            {assignmentName}
          </AppText>
          <AppText
            variant="caption"
            style={styles.courseName}
            numberOfLines={1}
          >
            {courseName}
          </AppText>
        </View>

        <View style={styles.dueRow}>
          <AppIcon
            name="time-outline"
            size={ROW_ICON_SIZE}
            color={colors.textSecondary}
          />
          <AppText variant="caption" style={styles.dueLabel} numberOfLines={1}>
            {dueLabel}
          </AppText>
          {statusLabel ? (
            <>
              <AppText variant="caption" style={styles.statusSeparator}>
                {"•"}
              </AppText>
              <AppText
                variant="caption"
                style={[
                  styles.statusText,
                  { color: URGENCY_TEXT_COLOR[urgencyColor] },
                ]}
                numberOfLines={1}
              >
                {statusLabel}
              </AppText>
            </>
          ) : null}
        </View>

        {completedLabel ? (
          <AppText variant="caption" style={styles.completedLabel}>
            {completedLabel}
          </AppText>
        ) : null}
      </Pressable>

      {actionStyle === "trash" && onPressAction ? (
        <Pressable
          style={styles.trashButton}
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || "Delete"}
        >
          <AppIcon
            name="trash-outline"
            size={TRASH_ICON_SIZE}
            color={colors.overdue}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

// Exposed in case another module needs the same mapping (kept alongside the component).
export { URGENCY_BAR_COLOR };

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.background,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardMuted: {
    opacity: 0.55,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
    paddingVertical: spacing.m,
    justifyContent: "space-between",
    minHeight: CARD_MIN_HEIGHT,
  },
  textGroupTop: {
    gap: spacing.xxs,
  },
  assignmentName: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  courseName: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
  dueRow: {
    marginTop: spacing.s,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
  },
  dueLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    flex: 1,
  },
  statusSeparator: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
  statusText: {
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
  },
  completedLabel: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
  trashButton: {
    marginRight: spacing.s,
    marginLeft: spacing.xs,
    padding: spacing.s,
    borderRadius: radius.s,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
