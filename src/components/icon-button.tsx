import { AppIcon } from "@/src/components";
import { Pressable, StyleSheet } from "react-native";

import {
  colors,
  constants,
  layout,
  motion,
  radius,
  shadows,
  spacing,
} from "@/src/theme";

type IconButtonProps = {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  colorToken?: keyof typeof colors;
  size?: number;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  colorToken = "buttonBg",
  size = layout.components.iconButton.defaultIconSize,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <AppIcon name={icon} size={size} color={colors[colorToken]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.components.iconButton.size,
    height: layout.components.iconButton.size,
    borderRadius: radius.l,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 0,
    padding: spacing.xs,
    ...shadows.shadowLight,
  },
  buttonPressed: {
    transform: [{ scale: motion.scalePressed }],
  },
});
