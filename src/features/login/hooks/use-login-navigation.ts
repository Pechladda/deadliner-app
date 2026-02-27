import { useNavigation } from "@react-navigation/native";

import type { LoginNav } from "../types";

export function useLoginNavigation() {
  return useNavigation<LoginNav>();
}
