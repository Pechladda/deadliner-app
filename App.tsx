import "expo-dev-client";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppNavigator } from "@/src/core/navigation";
import { useAuthStore } from "@/src/store/auth-store";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors } from "@/src/theme";

const DEFAULT_FONT_FAMILY = "Roboto_400Regular";
const BOLD_FONT_FAMILY = "Roboto_700Bold";

const WEB_VIEWPORT_STYLE_ID = "deadliner-web-viewport-style";

const LOADING_LOGO_SIZE = 120;
const LOADING_LOGO_MARGIN_BOTTOM = 20;

if (Platform.OS === "web") {
  const injectWebViewportStyles = () => {
    if (document.getElementById(WEB_VIEWPORT_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = WEB_VIEWPORT_STYLE_ID;
    style.appendChild(
      document.createTextNode(`
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          overflow: hidden;
        }

        #root {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      `),
    );

    document.head.appendChild(style);
  };

  injectWebViewportStyles();
}

function applyDefaultTextFont(fontFamily: string) {
  const textWithDefaults = Text as typeof Text & {
    defaultProps?: { style?: unknown };
  };
  const previousDefaults = textWithDefaults.defaultProps ?? {};
  const previousStyle = previousDefaults.style;
  const existingStyles = Array.isArray(previousStyle)
    ? previousStyle
    : previousStyle
      ? [previousStyle]
      : [];

  textWithDefaults.defaultProps = {
    ...previousDefaults,
    style: [...existingStyles, { fontFamily }],
  };
}

export default function App() {
  const [fontsLoaded] = useFonts({
    [DEFAULT_FONT_FAMILY]: require("./assets/fonts/Roboto-Regular.ttf"),
    [BOLD_FONT_FAMILY]: require("./assets/fonts/Roboto-Bold.ttf"),
    Ionicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"),
    MaterialIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"),
    Feather: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"),
    FontAwesome: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
    AntDesign: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf"),
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const hydrateNotificationsSetting = useDeadlineStore(
    (state) => state.hydrateNotificationsSetting,
  );

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }
    applyDefaultTextFont(DEFAULT_FONT_FAMILY);
  }, [fontsLoaded]);

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
    <GestureHandlerRootView style={styles.rootContainer}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: LOADING_LOGO_SIZE,
    height: LOADING_LOGO_SIZE,
    marginBottom: LOADING_LOGO_MARGIN_BOTTOM,
  },
});
