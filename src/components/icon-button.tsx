import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import {
    colors,
    motion,
    radius,
    shadows,
    sharedComponentTokens,
    spacing,
} from "@/src/theme";

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  colorToken?: keyof typeof colors;
  size?: number;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  colorToken = "textPrimary",
  size = sharedComponentTokens.iconButtonDefaultIconSize,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={size} color={colors[colorToken]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sharedComponentTokens.iconButtonSize,
    height: sharedComponentTokens.iconButtonSize,
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
