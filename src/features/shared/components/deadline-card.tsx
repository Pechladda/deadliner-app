import { AppText } from "@/src/components";
import {
  colors,
  radius,
  spacing,
  typography,
} from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  View
} from "react-native";

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

const urgencyColorMap: Record<UrgencyColor, string> = {
  red: colors.overdue,
  orange: colors.urgent,
  yellow: colors.soon,
  green: colors.onTrack,
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
  actionLabel,
  actionStyle = "text",
  muted = false,
}: DeadlineCardProps) {

  return (
    <View style={[styles.cardPlain, muted && { opacity: 0.6 }]}>
      <Pressable
        style={styles.content}
        onPress={() => {
          onPressCard?.();
        }}
        disabled={!onPressCard}
        accessibilityRole={onPressCard ? "button" : undefined}
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

      {/* Delete button (trash) for HistoryScreen */}
      {actionStyle === "trash" && onPressAction ? (
        <Pressable
          style={styles.trashButton}
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || "Delete"}
        >
          <Ionicons name="trash-outline" size={22} color={colors.overdue} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cardPlain: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.borderSoft,
    borderRadius: radius.s,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    paddingLeft: spacing.l,
    paddingRight: spacing.l,
    paddingVertical: spacing.l,
    justifyContent: "space-between",
    minHeight: 68,
  },

  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    paddingLeft: spacing.m,
    paddingRight: spacing.m,
    paddingVertical: spacing.m,
    justifyContent: "space-between",
    minHeight: 68,
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
    color: colors.textSecondary,
    fontSize: typography.size.m,
  },
  courseName: {
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
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButton: {
    marginRight: spacing.s,
    marginLeft: spacing.s,
    width: 34,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
  },
  trashButton: {
    marginRight: spacing.xs,
    marginLeft: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.s,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  doneButtonText: {
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
  },
});