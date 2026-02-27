import { useNavigation } from "@react-navigation/native";

import type { SettingsNav } from "../types";

export function useSettingsNavigation() {
  return useNavigation<SettingsNav>();
}
