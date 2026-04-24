import { AppIcon } from "@/src/components";
import { useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";

import {
  colors,
  constants,
  layout,
  motion,
  radius,
  spacing,
  typography,
} from "@/src/theme";

import { AppText } from "./app-text";

type AppButtonProps = {
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: "solid" | "outline";
  size?: "default" | "compact";
  labelVariant?:
    | "display"
    | "title"
    | "section"
    | "subtitle"
    | "bodyMedium"
    | "body"
    | "caption";
  iconName?: string;
  iconColorToken?: keyof typeof colors;
  labelColorToken?: keyof typeof colors;
  disabled?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
};

export function AppButton({
  title,
  label,
  onPress,
  variant = "solid",
  size = "default",
  labelVariant = "bodyMedium",
  iconName,
  iconColorToken,
  labelColorToken,
  disabled = false,
  isLoading,
  loading = false,
  loadingLabel,
  accessibilityLabel,
}: AppButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isOutline = variant === "outline";
  const resolvedLabel = title ?? label ?? "";
  const resolvedLoading = isLoading ?? loading;
  const isDisabled = disabled || resolvedLoading;
  const iconColor = iconColorToken
    ? colors[iconColorToken]
    : isOutline
      ? colors.textPrimary
      : colors.surface;
  const labelColor = labelColorToken
    ? colors[labelColorToken]
    : isOutline
      ? colors.textPrimary
      : colors.surface;

  const animateTo = (value: number, duration: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration,
      useNativeDriver: Platform.OS !== "web",
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
        accessibilityLabel={accessibilityLabel}
        disabled={isDisabled}
      >
        <View style={styles.inner}>
          {iconName ? (
            <AppIcon
              name={iconName}
              size={layout.components.button.iconSize}
              color={iconColor}
            />
          ) : null}
          <AppText
            variant={labelVariant}
            style={[
              isOutline ? styles.outlineLabel : styles.solidLabel,
              { color: labelColor },
            ]}
          >
            {resolvedLoading ? (loadingLabel ?? resolvedLabel) : resolvedLabel}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.components.button.minHeight,
    borderRadius: radius.s,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: 0,
  },
  baseCompact: {
    minHeight: layout.components.button.compactMinHeight,
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
    opacity: layout.components.button.disabledOpacity,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  solidLabel: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
  },
  outlineLabel: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
});
