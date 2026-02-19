import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

import { AppText } from "./AppText";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline";
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColorToken?: keyof typeof colors;
};

export function AppButton({
  label,
  onPress,
  variant = "solid",
  iconName,
  iconColorToken,
}: AppButtonProps) {
  const isOutline = variant === "outline";
  const iconColor = iconColorToken
    ? colors[iconColorToken]
    : isOutline
      ? colors.textPrimary
      : colors.buttonText;

  return (
    <Pressable
      style={[styles.base, isOutline ? styles.outline : styles.solid]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.inner}>
        {iconName ? (
          <Ionicons name={iconName} size={18} color={iconColor} />
        ) : null}
        <AppText
          variant="button"
          style={isOutline ? styles.outlineLabel : styles.solidLabel}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 60,
    borderRadius: radius.l,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.l,
    borderWidth: 1,
  },
  solid: {
    backgroundColor: colors.buttonBg,
    borderColor: colors.buttonBg,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  solidLabel: {
    color: colors.buttonText,
    fontWeight: typography.weight.bold,
  },
  outlineLabel: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
  },
});
