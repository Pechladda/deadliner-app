import { useNavigation, useRoute } from "@react-navigation/native";

import type { AddDeadlineNavigationProp, AddDeadlineRouteProp } from "../types";

export function useAddDeadlineNavigation() {
  return useNavigation<AddDeadlineNavigationProp>();
}

export function useAddDeadlineRoute() {
  return useRoute<AddDeadlineRouteProp>();
}
