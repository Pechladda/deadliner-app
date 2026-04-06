import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "@/src/core/navigation";
import { StackRoutes } from "@/src/core/navigation";
import type { DeadlineStatus } from "@/src/core/utils";

export type MissingStateProps = {
  onPressBack: () => void;
};

export type CountdownCardProps = {
  dueAt: string;
  status: DeadlineStatus;
  now: Date;
};

export type ActionRowProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export type DeadlineDetailRoute = RouteProp<
  RootStackParamList,
  typeof StackRoutes.DeadlineDetail
>;

export type DeadlineDetailNav = NativeStackNavigationProp<RootStackParamList>;
