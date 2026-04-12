import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";

import type { TabParamList } from "@/src/core/navigation/app-navigator";
import { TabRoutes } from "@/src/core/navigation/route-names";

export type PickerMode = "date" | "time";

export type AddDeadlineNav = BottomTabNavigationProp<
  TabParamList,
  typeof TabRoutes.AddDeadline
>;

export type AddDeadlineRoute = RouteProp<
  TabParamList,
  typeof TabRoutes.AddDeadline
>;
