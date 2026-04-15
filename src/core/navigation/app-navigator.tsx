import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    NavigationContainer,
    NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

import { AddDeadlineScreen } from "@/src/features/add-deadline";
import { DeadlineDetailScreen } from "@/src/features/deadline-detail";
import { HomeScreen } from "@/src/features/home-deadline-list";
import {
    ForgotPasswordScreen,
    LoginScreen,
    RegisterScreen,
} from "@/src/features/login";
import { SettingsScreen } from "@/src/features/settings";
import {
    AboutAppScreen,
    HistoryScreen,
    PrivacyPolicyScreen,
    ProfileScreen,
} from "@/src/features/settings/screens";
import { useAuthStore } from "@/src/store/auth-store";
import { colors, screenSharedTokens } from "@/src/theme";

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
  [StackRoutes.ForgotPassword]: undefined;
  [StackRoutes.Register]: undefined;
  [StackRoutes.MainTabs]: NavigatorScreenParams<TabParamList> | undefined;
  [StackRoutes.DeadlineDetail]: { id: string };
  [StackRoutes.AboutApp]: undefined;
  [StackRoutes.PrivacyPolicy]: undefined;
  [StackRoutes.Profile]: undefined;
  [StackRoutes.History]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type AnimatedTabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
};

function AnimatedTabIcon({ name, focused, color, size }: AnimatedTabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: screenSharedTokens.navigationTabActiveTint,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <BlurView
            intensity={45}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopWidth: 0,
          borderColor: colors.background,
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
          shadowOpacity: 0,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tab.Screen
        name={TabRoutes.Home}
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "home" : "home-outline"}
              size={size + 2}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.AddDeadline}
        component={AddDeadlineScreen}
        options={{
          title: "Add",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size + 6}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={TabRoutes.Settings}
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "settings" : "settings-outline"}
              size={size + 2}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const syncAuthFromFirebase = useAuthStore(
    (state) => state.syncAuthFromFirebase,
  );

  useEffect(() => {
    const unsubscribe = syncAuthFromFirebase();
    return unsubscribe;
  }, [syncAuthFromFirebase]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={
          isAuthenticated ? StackRoutes.MainTabs : StackRoutes.Login
        }
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name={StackRoutes.Login} component={LoginScreen} />
            <Stack.Screen
              name={StackRoutes.ForgotPassword}
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name={StackRoutes.Register}
              component={RegisterScreen}
            />
            <Stack.Screen
              name={StackRoutes.PrivacyPolicy}
              component={PrivacyPolicyScreen}
            />
          </>
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
              name={StackRoutes.PrivacyPolicy}
              component={PrivacyPolicyScreen}
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
