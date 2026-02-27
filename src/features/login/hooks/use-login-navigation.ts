import { useNavigation } from "@react-navigation/native";

import type { LoginNavigationProp } from "../types";

export function useLoginNavigation() {
  return useNavigation<LoginNavigationProp>();
}
