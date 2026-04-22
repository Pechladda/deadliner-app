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
  [StackRoutes.ForgotPassword]: undefined;
  [StackRoutes.Register]: undefined;
  [StackRoutes.MainTabs]: NavigatorScreenParams<TabParamList> | undefined;
  [StackRoutes.DeadlineDetail]: { id: string };
  [StackRoutes.AboutApp]: undefined;
  [StackRoutes.PrivacyPolicy]: undefined;
  [StackRoutes.Profile]: undefined;
  [StackRoutes.History]: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const BottomTab = createBottomTabNavigator<TabParamList>();

const TAB_BAR_BLUR_INTENSITY = 45;
const TAB_BAR_HEIGHT = 68;
const TAB_BAR_PADDING_BOTTOM = 8;
const TAB_BAR_PADDING_TOP = 6;
const TAB_BAR_SHADOW_RADIUS = 18;
const TAB_BAR_SHADOW_OFFSET = { width: 0, height: 10 } as const;
const TAB_ITEM_PADDING_VERTICAL = 6;

const DEFAULT_TAB_ICON_SIZE_DELTA = 2;
const ADD_TAB_ICON_SIZE_DELTA = 6;

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
};

function AnimatedTabIcon({ name, color, size }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

function MainTabs() {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.buttonBg,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <BlurView
            intensity={TAB_BAR_BLUR_INTENSITY}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          height: TAB_BAR_HEIGHT,
          paddingBottom: TAB_BAR_PADDING_BOTTOM,
          paddingTop: TAB_BAR_PADDING_TOP,
          borderTopWidth: 0,
          borderColor: colors.background,
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
          shadowOpacity: 0,
          shadowRadius: TAB_BAR_SHADOW_RADIUS,
          shadowOffset: TAB_BAR_SHADOW_OFFSET,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: TAB_ITEM_PADDING_VERTICAL,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <BottomTab.Screen
        name={TabRoutes.Home}
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "home" : "home-outline"}
              size={size + DEFAULT_TAB_ICON_SIZE_DELTA}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name={TabRoutes.AddDeadline}
        component={AddDeadlineScreen}
        options={{
          title: "Add",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size + ADD_TAB_ICON_SIZE_DELTA}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name={TabRoutes.Settings}
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name={focused ? "settings" : "settings-outline"}
              size={size + DEFAULT_TAB_ICON_SIZE_DELTA}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
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

  const initialRouteName = isAuthenticated
    ? StackRoutes.MainTabs
    : StackRoutes.Login;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <>
            <RootStack.Screen
              name={StackRoutes.Login}
              component={LoginScreen}
            />
            <RootStack.Screen
              name={StackRoutes.ForgotPassword}
              component={ForgotPasswordScreen}
            />
            <RootStack.Screen
              name={StackRoutes.Register}
              component={RegisterScreen}
            />
            <RootStack.Screen
              name={StackRoutes.PrivacyPolicy}
              component={PrivacyPolicyScreen}
            />
          </>
        ) : (
          <>
            <RootStack.Screen
              name={StackRoutes.MainTabs}
              component={MainTabs}
            />
            <RootStack.Screen
              name={StackRoutes.DeadlineDetail}
              component={DeadlineDetailScreen}
            />
            <RootStack.Screen
              name={StackRoutes.AboutApp}
              component={AboutAppScreen}
            />
            <RootStack.Screen
              name={StackRoutes.PrivacyPolicy}
              component={PrivacyPolicyScreen}
            />
            <RootStack.Screen
              name={StackRoutes.Profile}
              component={ProfileScreen}
            />
            <RootStack.Screen
              name={StackRoutes.History}
              component={HistoryScreen}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
