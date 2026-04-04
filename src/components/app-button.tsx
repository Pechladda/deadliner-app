import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import {
  colors,
  motion,
  radius,
  shadows,
  spacing,
  typography,
} from "@/src/theme";

import { AppText } from "./app-text";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline";
  size?: "default" | "compact";
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColorToken?: keyof typeof colors;
  labelColorToken?: keyof typeof colors;
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = "solid",
  size = "default",
  iconName,
  iconColorToken,
  labelColorToken,
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isOutline = variant === "outline";
  const isDisabled = disabled || loading;
  const iconColor = iconColorToken
    ? colors[iconColorToken]
    : isOutline
      ? colors.textPrimary
      : colors.buttonText;
  const labelColor = labelColorToken
    ? colors[labelColorToken]
    : isOutline
      ? colors.textPrimary
      : colors.buttonText;

  const animateTo = (value: number, duration: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[
          styles.base,
          size === "compact" && styles.baseCompact,
          isOutline ? styles.outline : styles.solid,
          isDisabled && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={() => animateTo(motion.scalePressed, motion.quick)}
        onPressOut={() => animateTo(1, motion.normal)}
        accessibilityRole="button"
        disabled={isDisabled}
      >
        <View style={styles.inner}>
          {iconName ? (
            <Ionicons name={iconName} size={18} color={iconColor} />
          ) : null}
          <AppText
            variant="button"
            style={[
              isOutline ? styles.outlineLabel : styles.solidLabel,
              { color: labelColor },
            ]}
          >
            {loading ? "..." : label}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    ...shadows.shadowLight,
  },
  baseCompact: {
    minHeight: 48,
  },
  solid: {
    backgroundColor: colors.buttonBg,
    borderColor: colors.buttonBg,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.55,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  solidLabel: {
    color: colors.buttonText,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.2,
  },
  outlineLabel: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
});
