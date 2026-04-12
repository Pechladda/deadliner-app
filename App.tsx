import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import "expo-dev-client";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "@/src/core/navigation";
import { LanguageProvider } from "@/src/providers/language-provider";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors } from "@/src/theme";

if (Platform.OS === "web") {
  const injectWebFonts = () => {
    const style = document.createElement("style");
    const fonts = [
      {
        name: "Ionicons",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
      },
      {
        name: "MaterialIcons",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"),
      },
      {
        name: "Feather",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"),
      },
      {
        name: "FontAwesome",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
      },
      {
        name: "AntDesign",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf"),
      },
      {
        name: "MaterialDesignIcons",
        font: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
      },
    ];

    const cssRules = fonts
      .map((f) => `@font-face { font-family: ${f.name}; src: url(${f.font}); }`)
      .join("\n");

    style.appendChild(document.createTextNode(cssRules));
    document.head.appendChild(style);
  };
  injectWebFonts();
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const hydrateNotificationsSetting = useDeadlineStore(
    (state) => state.hydrateNotificationsSetting,
  );

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    void hydrateNotificationsSetting();
  }, [hydrateNotificationsSetting]);

  if (!isHydrated || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("@/assets/images/app-icon.png")}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator color={colors.textPrimary} size="large" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});
