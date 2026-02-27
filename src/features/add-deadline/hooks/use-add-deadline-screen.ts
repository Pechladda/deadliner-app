import { useNavigation, useRoute } from "@react-navigation/native";

import type { AddDeadlineNav, AddDeadlineRoute } from "../types";

export function useAddDeadlineNavigation() {
  return useNavigation<AddDeadlineNav>();
}

export function useAddDeadlineRoute() {
  return useRoute<AddDeadlineRoute>();
}
