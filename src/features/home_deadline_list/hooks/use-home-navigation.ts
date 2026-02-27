import { useNavigation } from "@react-navigation/native";

import type { HomeNavigationProp } from "../types";

export function useHomeNavigation() {
  return useNavigation<HomeNavigationProp>();
}
