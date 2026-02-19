import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/src/components/AppText";
import { IconButton } from "@/src/components/IconButton";
import {
  RootStackParamList,
  TabParamList,
} from "@/src/core/navigation/AppNavigator";
import { StackRoutes, TabRoutes } from "@/src/core/navigation/routeNames";
import { formatDueLabel } from "@/src/core/utils/deadlineUtils";
import { DeadlineCard } from "@/src/features/shared/components";
import { useDeadlineStore } from "@/src/store/deadlineStore";
import { colors, spacing } from "@/src/theme";

export function HomeScreen() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<TabParamList, typeof TabRoutes.Home>,
        NativeStackNavigationProp<RootStackParamList>
      >
    >();
  const deadlines = useDeadlineStore((state) => state.deadlines);
  const loadDeadlines = useDeadlineStore((state) => state.loadDeadlines);

  useEffect(() => {
    loadDeadlines();
  }, [loadDeadlines]);

  const onPressBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const onPressAdd = () => {
    navigation.navigate(TabRoutes.AddDeadline);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={onPressBack}
            accessibilityLabel="Go back"
          />
          <AppText variant="title">My Deadlines</AppText>
          <IconButton
            icon="add"
            onPress={onPressAdd}
            accessibilityLabel="Create new deadline"
          />
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
              accessibilityLabel={`${item.assignmentName}, due ${formatDueLabel(item.dueAt)}`}
            >
              <DeadlineCard
                assignmentName={item.assignmentName}
                courseName={item.courseName}
                dueLabel={`Due: ${formatDueLabel(item.dueAt)}`}
                urgencyColor={item.colorStatus}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <AppText variant="caption" style={styles.emptyText}>
              No deadlines yet.
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
    justifyContent: "space-between",
    marginBottom: spacing.l,
  },
  listContent: {
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  emptyText: { textAlign: "center", marginTop: spacing.l },
});
