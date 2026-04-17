import { AppText } from "@/src/components";
import {
  colors,
  deadlineCardTokens,
  radius,
  spacing,
  typography,
} from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

type UrgencyColor = "red" | "orange" | "yellow" | "green" | "gray";
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
  cardAccessibilityLabel?: string;
  actionLabel?: string;
  actionStyle?: ActionStyle;
  muted?: boolean;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
};

const urgencyColorMap: Record<UrgencyColor, string> = {
  red: colors.priorityOverdue,
  orange: colors.priorityUrgent,
  yellow: colors.priorityYellow,
  green: colors.priorityGreen,
  gray: colors.borderSoft,
};

export function DeadlineCard({
  assignmentName,
  courseName,
  dueLabel,
  statusLabel,
  urgencyColor,
  completedLabel,
  onPressAction,
  onPressCard,
  cardAccessibilityLabel,
  actionLabel,
  actionStyle = "text",
  muted = false,
  style,
  gradientColors,
}: DeadlineCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.25)).current;
  const cardBaseColors = [colors.background, colors.background] as const;

  // Removed handlePressAction and all unused code
  return (
    <View style={styles.cardPlain}>
      <Pressable
        style={styles.content}
        onPress={() => {
          onPressCard?.();
        }}
        disabled={!onPressCard}
        accessibilityRole={onPressCard ? "button" : undefined}
        accessibilityLabel={cardAccessibilityLabel}
      >
        <View style={styles.textGroupTop}>
          <AppText
            variant="subtitle"
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
          <AppText variant="caption" style={styles.dueLabel} numberOfLines={1}>
            {dueLabel}
          </AppText>
          {statusLabel ? (
            <>
              <AppText variant="caption" style={styles.statusSeparator}>
                •
              </AppText>
              <AppText
                variant="caption"
                style={[
                  styles.statusText,
                  { color: urgencyColorMap[urgencyColor] },
                ]}
                numberOfLines={1}
              >
                {statusLabel}
              </AppText>
            </>
          ) : null}
        </View>

        {completedLabel ? (
          <AppText
            variant="caption"
            style={styles.completedLabel}
            numberOfLines={1}
          >
            {completedLabel}
          </AppText>
        ) : null}
      </Pressable>
      {/* Delete button (trash) */}
      {actionStyle === "trash" && onPressAction ? (
        <Pressable
          style={styles.trashButton}
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || "Delete"}
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: radius.s,
    overflow: "visible",
  },
  cardPlain: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
    paddingVertical: spacing.m,
    justifyContent: "space-between",
    minHeight: 98,
  },
  trashButton: {
    marginRight: spacing.m,
    marginLeft: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.s,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  glow: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 8,
    bottom: 6,
    borderRadius: radius.s,
    zIndex: -1,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
    paddingVertical: spacing.m,
    justifyContent: "space-between",
    minHeight: 98,
  },
  textGroupTop: {
    gap: spacing.xxs,
  },
  dueRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  assignmentName: {
    color: colors.primary,
  },
  courseName: {
    marginTop: spacing.xxs,
    color: colors.textSecondary,
  },
  dueLabel: {
    color: colors.textSecondary,
  },
  statusSeparator: {
    color: colors.textSecondary,
  },
  statusText: {
    fontWeight: typography.weight.bold,
  },
  completedLabel: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  doneButton: {
    marginRight: spacing.s,
    marginLeft: spacing.s,
    borderColor: colors.border,
    borderRadius: radius.pill,
    minHeight: 30,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    backgroundColor: deadlineCardTokens.actionButtonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    marginRight: spacing.s,
    marginLeft: spacing.s,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: deadlineCardTokens.actionButtonBackground,
    borderColor: colors.borderSoft,
  },
  doneButtonText: {
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
  },
});
