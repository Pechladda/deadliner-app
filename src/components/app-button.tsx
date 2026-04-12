import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import {
    colors,
    motion,
    radius,
    shadows,
    sharedComponentTokens,
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
  iconName?: keyof typeof Ionicons.glyphMap;
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
        accessibilityLabel={accessibilityLabel}
        disabled={isDisabled}
      >
        <View style={styles.inner}>
          {iconName ? (
            <Ionicons
              name={iconName}
              size={sharedComponentTokens.appButtonDefaultIconSize}
              color={iconColor}
            />
          ) : null}
          <AppText
            variant="button"
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
    minHeight: sharedComponentTokens.appButtonMinHeight,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    ...shadows.shadowLight,
  },
  baseCompact: {
    minHeight: sharedComponentTokens.appButtonCompactMinHeight,
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
    opacity: sharedComponentTokens.appButtonDisabledOpacity,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  solidLabel: {
    color: colors.buttonText,
    fontWeight: typography.weight.bold,
    letterSpacing: sharedComponentTokens.appButtonSolidLabelLetterSpacing,
  },
  outlineLabel: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
});
