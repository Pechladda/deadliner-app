import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { t } from "@/src/core/utils";
import { AddDeadlineScreen } from "@/src/features/add-deadline";
import { DeadlineDetailScreen } from "@/src/features/deadline-detail";
import { HomeScreen } from "@/src/features/home-deadline-list";
import { LoginScreen } from "@/src/features/login";
import { SettingsScreen } from "@/src/features/settings";
import { AboutAppScreen } from "@/src/features/settings/screens/about-app-screen";
import { HistoryScreen } from "@/src/features/settings/screens/history-screen";
import { ProfileScreen } from "@/src/features/settings/screens/profile-screen";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors } from "@/src/theme";

import { StackRoutes, TabRoutes } from "./route-names";

export type TabParamList = {
  [TabRoutes.Home]: undefined;
  [TabRoutes.AddDeadline]:
    | { deadlineId?: string; mode?: "edit"; id?: string }
    | undefined;
  [TabRoutes.Settings]: undefined;
};

export type RootStackParamList = {
  [StackRoutes.Login]: undefined;
  [StackRoutes.MainTabs]: NavigatorScreenParams<TabParamList> | undefined;
  [StackRoutes.DeadlineDetail]: { id: string };
  [StackRoutes.AboutApp]: undefined;
  [StackRoutes.Profile]: undefined;
  [StackRoutes.History]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tab.Screen
        name={TabRoutes.Home}
        component={HomeScreen}
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.AddDeadline}
        component={AddDeadlineScreen}
        options={{
          title: t("tabAdd"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.Settings}
        component={SettingsScreen}
        options={{
          title: t("tabSettings"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const hydrateNotificationsSetting = useDeadlineStore(
    (state) => state.hydrateNotificationsSetting,
  );

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    void hydrateNotificationsSetting();
  }, [hydrateNotificationsSetting]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          isAuthenticated ? StackRoutes.MainTabs : StackRoutes.Login
        }
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name={StackRoutes.Login} component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name={StackRoutes.MainTabs} component={MainTabs} />
            <Stack.Screen
              name={StackRoutes.DeadlineDetail}
              component={DeadlineDetailScreen}
            />
            <Stack.Screen
              name={StackRoutes.AboutApp}
              component={AboutAppScreen}
            />
            <Stack.Screen
              name={StackRoutes.Profile}
              component={ProfileScreen}
            />
            <Stack.Screen
              name={StackRoutes.History}
              component={HistoryScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
