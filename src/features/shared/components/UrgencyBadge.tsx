import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

type UrgencyBadgeProps = {
  timeLeft: string;
  isUrgent: boolean;
};

export function UrgencyBadge({ timeLeft, isUrgent }: UrgencyBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons
          name="alarm-outline"
          size={16}
          color={colors.priorityRed}
          style={styles.icon}
        />
        <Text style={styles.timeLeft} numberOfLines={1}>
          {timeLeft}
        </Text>
      </View>

      {isUrgent ? (
        <View style={styles.urgentPill}>
          <Text style={styles.urgentText}>URGENT</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
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
    fontSize: 14,
    fontWeight: "600",
  },
  urgentPill: {
    borderRadius: 999,
    backgroundColor: colors.priorityRed,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  urgentText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: "700",
  },
});
