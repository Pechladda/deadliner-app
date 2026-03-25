import { useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    type ViewStyle,
} from "react-native";

import { AppText } from "@/src/components";
import {
    colors,
    motion,
    radius,
    shadows,
    spacing,
    typography,
} from "@/src/theme";

type UrgencyColor = "red" | "yellow" | "green";

type DeadlineCardProps = {
  assignmentName: string;
  courseName: string;
  dueLabel: string;
  urgencyColor: UrgencyColor;
  completedLabel?: string;
  onPressAction?: () => void;
  onPressCard?: () => void;
  cardAccessibilityLabel?: string;
  actionLabel?: string;
  muted?: boolean;
  style?: ViewStyle;
};

const urgencyColorMap: Record<UrgencyColor, string> = {
  red: colors.priorityRed,
  yellow: colors.priorityYellow,
  green: colors.priorityGreen,
};

export function DeadlineCard({
  assignmentName,
  courseName,
  dueLabel,
  urgencyColor,
  completedLabel,
  onPressAction,
  onPressCard,
  cardAccessibilityLabel,
  actionLabel,
  muted = false,
  style,
}: DeadlineCardProps) {
  const animation = useRef(new Animated.Value(1)).current;

  const handlePressAction = () => {
    if (!onPressAction) {
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(animation, {
          toValue: motion.scalePressed,
          duration: motion.quick,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: motion.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        onPressAction();
        animation.setValue(1);
      }
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        muted && styles.cardMuted,
        style,
        { opacity: animation, transform: [{ scale: animation }] },
      ]}
    >
      <View
        style={[
          styles.urgencyBar,
          { backgroundColor: urgencyColorMap[urgencyColor] },
        ]}
      />

      <Pressable
        style={styles.content}
        onPress={onPressCard}
        disabled={!onPressCard}
        accessibilityRole={onPressCard ? "button" : undefined}
        accessibilityLabel={cardAccessibilityLabel}
      >
        <AppText
          variant="cardTitle"
          style={styles.assignmentName}
          numberOfLines={1}
        >
          {assignmentName}
        </AppText>
        <AppText style={styles.courseName} numberOfLines={1}>
          {courseName}
        </AppText>
        <AppText variant="caption" style={styles.dueLabel} numberOfLines={1}>
          {dueLabel}
        </AppText>
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

      {onPressAction && actionLabel ? (
        <Pressable
          onPress={handlePressAction}
          style={styles.doneButton}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <AppText variant="caption" style={styles.doneButtonText}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: colors.borderSoft,
    ...shadows.shadowCard,
  },
  cardMuted: {
    opacity: 0.72,
  },
  urgencyBar: {
    width: 8,
    height: 80,
    borderRadius: radius.pill,
    marginLeft: spacing.s,
    marginRight: spacing.s,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.s,
    paddingRight: spacing.m,
    paddingVertical: spacing.l,
    justifyContent: "space-between",
    minHeight: 104,
  },
  assignmentName: {
    lineHeight: typography.lineHeight.relaxed,
  },
  courseName: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  dueLabel: {
    marginTop: spacing.s,
    color: colors.textSecondary,
  },
  completedLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  doneButton: {
    marginRight: spacing.s,
    marginLeft: spacing.s,
    borderWidth: 0,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    backgroundColor: colors.chipBg,
  },
  doneButtonText: {
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
});
