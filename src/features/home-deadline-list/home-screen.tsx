import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, IconButton } from "@/src/components";
import { StackRoutes, TabRoutes } from "@/src/core/navigation";
import { formatDueLabel, t } from "@/src/core/utils";
import { useHomeNavigation } from "@/src/features/home-deadline-list/hooks/use-home-navigation";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, spacing } from "@/src/theme";

export function HomeScreen() {
  const navigation = useHomeNavigation();
  const deadlines = useDeadlineStore((state) => state.deadlines);
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);

  useEffect(() => {
    loadDeadlines();
  }, [loadDeadlines]);

  const onPressAdd = () => {
    navigation.navigate(TabRoutes.AddDeadline);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <AppText variant="title" style={styles.headerTitle}>
            {t("myDeadlines")}
          </AppText>
          <View style={styles.addButton}>
            <IconButton
              icon="add"
              onPress={onPressAdd}
              accessibilityLabel={t("createNewDeadline")}
            />
          </View>
        </View>

        <FlatList
          data={deadlines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                navigation.navigate(StackRoutes.DeadlineDetail, {
                  id: item.id,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.assignmentName}, ${t("due")} ${formatDueLabel(item.dueAt)}`}
            >
              <View style={styles.cardWrapper}>
                <DeadlineCard
                  assignmentName={item.assignmentName}
                  courseName={item.courseName}
                  dueLabel={`${t("duePrefix")} ${formatDueLabel(item.dueAt)}`}
                  urgencyColor={item.colorStatus}
                />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <AppText variant="caption" style={styles.emptyText}>
              {t("noDeadlinesYet")}
            </AppText>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.s },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: spacing.l,
  },
  headerTitle: {
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 0,
  },
  listContent: {
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    borderWidth: 1,
    borderColor: "rgba(199, 199, 199, 0.42)",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 3,
    overflow: "hidden",
  },
  emptyText: { textAlign: "center", marginTop: spacing.l },
});
