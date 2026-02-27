import { useNavigation } from "@react-navigation/native";

import type { SettingsNavigationProp } from "../types";

export function useSettingsNavigation() {
  return useNavigation<SettingsNavigationProp>();
}
