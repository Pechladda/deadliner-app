import { useNavigation, useRoute } from "@react-navigation/native";

import type { DeadlineDetailNav, DeadlineDetailRoute } from "../types";

export function useDeadlineDetailNavigation() {
  return useNavigation<DeadlineDetailNav>();
}

export function useDeadlineDetailRoute() {
  return useRoute<DeadlineDetailRoute>();
}
