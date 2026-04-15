import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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
  deadlineCardTokens,
  motion,
  radius,
  shadows,
  spacing,
  typography,
} from "@/src/theme";

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

  const handlePressAction = () => {
    if (!onPressAction) {
      return;
    }

    Animated.sequence([
      Animated.timing(scale, {
        toValue: motion.scalePressed,
        duration: motion.quick,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.92,
        duration: motion.normal,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onPressAction();
        scale.setValue(1);
      }
    });
  };

  const pulse = () => {
    Animated.sequence([
      Animated.timing(glow, {
        toValue: 0.5,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 0.25,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardShell,
        muted && styles.cardMuted,
        style,
        { transform: [{ scale }] },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: urgencyColorMap[urgencyColor],
            opacity: glow,
          },
        ]}
      />

      <LinearGradient
        colors={cardBaseColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.innerBorder} />

        <Pressable
          style={styles.content}
          onPress={() => {
            pulse();
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
            <AppText
              variant="caption"
              style={styles.dueLabel}
              numberOfLines={1}
            >
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

        {onPressAction && actionLabel ? (
          <Pressable
            onPress={handlePressAction}
            style={
              actionStyle === "check" ? styles.checkButton : styles.doneButton
            }
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            {actionStyle === "check" ? (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.priorityGreen}
              />
            ) : actionStyle === "trash" ? (
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.textSecondary}
              />
            ) : (
              <AppText variant="caption" style={styles.doneButtonText}>
                {actionLabel}
              </AppText>
            )}
          </Pressable>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: radius.xl,
    overflow: "visible",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: colors.borderSoft,
    ...shadows.shadowSoft,
  },
  glow: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 8,
    bottom: 6,
    borderRadius: radius.xl,
    zIndex: -1,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderColor: deadlineCardTokens.innerBorder,
    borderRadius: radius.xl,
  },
  cardMuted: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
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
    color: colors.textPrimary,
  },
  courseName: {
    marginTop: spacing.xxs,
    color: colors.textPrimary,
  },
  dueLabel: {
    color: colors.textPrimary,
  },
  statusSeparator: {
    color: colors.textSecondary,
  },
  statusText: {
    fontWeight: typography.weight.medium,
  },
  completedLabel: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
  doneButton: {
    marginRight: spacing.s,
    marginLeft: spacing.s,
    borderWidth: 0,
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
    borderWidth: 0,
    borderColor: colors.borderSoft,
  },
  doneButtonText: {
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
});
