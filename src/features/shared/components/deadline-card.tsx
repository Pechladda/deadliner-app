import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

type UrgencyColor = "red" | "yellow" | "green";

type DeadlineCardProps = {
  assignmentName: string;
  courseName: string;
  dueLabel: string;
  urgencyColor: UrgencyColor;
};

const urgencyColorMap: Record<UrgencyColor, string> = {
  red: colors.priorityRed,
  yellow: colors.priorityYellow,
  green: colors.priorityGreen,
};

export function DeadlineCard({
  assignmentName,
  courseName,
  dueLabel,
  urgencyColor,
}: DeadlineCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.urgencyBar,
          { backgroundColor: urgencyColorMap[urgencyColor] },
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.assignmentName} numberOfLines={1}>
          {assignmentName}
        </Text>
        <Text style={styles.courseName} numberOfLines={1}>
          {courseName}
        </Text>
        <Text style={styles.dueLabel} numberOfLines={1}>
          {dueLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  urgencyBar: {
    width: 4,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    justifyContent: "space-between",
    minHeight: 96,
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  courseName: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
  },
  dueLabel: {
    marginTop: spacing.s,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
