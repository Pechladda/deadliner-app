import { useNavigation } from "@react-navigation/native";

import type { HomeNav } from "../types";

export function useHomeNavigation() {
  return useNavigation<HomeNav>();
}
