import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

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
        <Text style={styles.timeLeft} numberOfLines={1}>
          {timeLeft}
        </Text>
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
    borderRadius: radius.l,
    backgroundColor: colors.urgentBg,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  icon: {
    marginRight: spacing.xs,
  },
  timeLeft: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "600",
  },
  statusPill: {
    width: 10,
    height: 52,
    borderRadius: 999,
  },
});
