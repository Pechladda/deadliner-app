import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddDeadlineScreen } from "@/src/features/add-deadline";
import { DeadlineDetailScreen } from "@/src/features/deadline-detail";
import { HomeScreen } from "@/src/features/home-deadline-list";
import { LoginScreen } from "@/src/features/login";
import { SettingsScreen } from "@/src/features/settings";
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
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.AddDeadline}
        component={AddDeadlineScreen}
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.Settings}
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={StackRoutes.Login}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={StackRoutes.Login} component={LoginScreen} />
        <Stack.Screen name={StackRoutes.MainTabs} component={MainTabs} />
        <Stack.Screen
          name={StackRoutes.DeadlineDetail}
          component={DeadlineDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
