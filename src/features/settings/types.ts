import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import type { TabParamList } from "@/src/core/navigation";
import { TabRoutes } from "@/src/core/navigation";

export type SettingsNavigationProp = BottomTabNavigationProp<
  TabParamList,
  typeof TabRoutes.Settings
>;
