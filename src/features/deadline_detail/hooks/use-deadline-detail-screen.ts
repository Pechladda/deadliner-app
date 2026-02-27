import { useNavigation, useRoute } from "@react-navigation/native";

import type {
  DeadlineDetailNavigationProp,
  DeadlineDetailRouteProp,
} from "../types";

export function useDeadlineDetailNavigation() {
  return useNavigation<DeadlineDetailNavigationProp>();
}

export function useDeadlineDetailRoute() {
  return useRoute<DeadlineDetailRouteProp>();
}
