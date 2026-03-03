import { useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from "react-native";

import { colors, radius, spacing } from "@/src/theme";

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
          toValue: 0.95,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 180,
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
        <Text style={styles.assignmentName} numberOfLines={1}>
          {assignmentName}
        </Text>
        <Text style={styles.courseName} numberOfLines={1}>
          {courseName}
        </Text>
        <Text style={styles.dueLabel} numberOfLines={1}>
          {dueLabel}
        </Text>
        {completedLabel ? (
          <Text style={styles.completedLabel} numberOfLines={1}>
            {completedLabel}
          </Text>
        ) : null}
      </Pressable>

      {onPressAction && actionLabel ? (
        <Pressable
          onPress={handlePressAction}
          style={styles.doneButton}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.doneButtonText}>{actionLabel}</Text>
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
    borderRadius: radius.l,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardMuted: {
    opacity: 0.72,
  },
  urgencyBar: {
    width: 10,
    height: 70,
    borderRadius: 999,
    marginLeft: spacing.m,
    marginRight: spacing.m,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    justifyContent: "space-between",
    minHeight: 96,
  },
  assignmentName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  courseName: {
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.textSecondary,
  },
  dueLabel: {
    marginTop: spacing.s,
    fontSize: 14,
    color: colors.textSecondary,
  },
  completedLabel: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },
  doneButton: {
    marginRight: spacing.m,
    marginLeft: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
  },
  doneButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});
