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

if (Platform.OS === "web") {
  const injectWebViewportStyles = () => {
    const styleId = "deadliner-web-viewport-style";
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
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

  const injectWebFonts = () => {
    const styleId = "deadliner-web-icon-fonts";
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
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

  injectWebViewportStyles();
  injectWebFonts();
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular: require("./assets/fonts/Roboto-Regular.ttf"),
    Roboto_700Bold: require("./assets/fonts/Roboto-Bold.ttf"),
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

    const textWithDefaults = Text as typeof Text & {
      defaultProps?: { style?: unknown };
    };
    const previousDefaults = textWithDefaults.defaultProps ?? {};
    const previousStyle = previousDefaults.style;
    const styleList = Array.isArray(previousStyle)
      ? previousStyle
      : previousStyle
        ? [previousStyle]
        : [];

    textWithDefaults.defaultProps = {
      ...previousDefaults,
      style: [...styleList, { fontFamily: "Roboto_400Regular" }],
    };
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
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});
