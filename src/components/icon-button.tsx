import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

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
  size = 22,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={size} color={colors[colorToken]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.m,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
  },
});
