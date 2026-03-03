import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "@/src/core/navigation";
import { LanguageProvider } from "@/src/providers/language-provider";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
