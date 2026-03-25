import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme";

type UrgencyBadgeProps = {
  timeLeft: string;
  status: "green" | "yellow" | "red";
};

const statusColorMap: Record<UrgencyBadgeProps["status"], string> = {
  green: colors.priorityGreen,
  yellow: colors.priorityYellow,
  red: colors.priorityRed,
};

export function UrgencyBadge({ timeLeft, status }: UrgencyBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons
          name="alarm-outline"
          size={16}
          color={statusColorMap[status]}
          style={styles.icon}
        />
        <AppText
          variant="sectionTitle"
          style={styles.timeLeft}
          numberOfLines={1}
        >
          {timeLeft}
        </AppText>
      </View>

      <View
        style={[styles.statusPill, { backgroundColor: statusColorMap[status] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    backgroundColor: colors.urgentBg,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  timeLeft: {
    color: colors.textPrimary,
    minWidth: 64,
    fontSize: typography.size.xl,
  },
  statusPill: {
    width: 8,
    height: 48,
    borderRadius: radius.pill,
  },
});
