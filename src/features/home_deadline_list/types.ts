import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList, TabParamList } from "@/src/core/navigation";
import { TabRoutes } from "@/src/core/navigation";

export type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, typeof TabRoutes.Home>,
  NativeStackNavigationProp<RootStackParamList>
>;
