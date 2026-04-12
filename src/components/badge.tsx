import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";
import { AppText } from "./app-text";

type BadgeTone = "danger" | "warning" | "success" | "neutral";

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const toneMap = {
  danger: { bg: colors.priorityOverdue, text: colors.buttonText },
  warning: { bg: colors.priorityYellow, text: colors.textPrimary },
  success: { bg: colors.priorityGreen, text: colors.textPrimary },
  neutral: { bg: colors.surface, text: colors.textPrimary },
} as const;

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const selected = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: selected.bg }]}>
      <AppText
        variant="caption"
        style={[styles.text, { color: selected.text }]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: "700",
  },
});
