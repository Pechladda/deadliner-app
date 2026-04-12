import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { pastelBackgroundTokens } from "@/src/theme";

export function PastelBackground() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <LinearGradient
        colors={pastelBackgroundTokens.gradientColors}
        locations={pastelBackgroundTokens.gradientLocations}
        start={{ x: 0.02, y: 0.02 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.aquaGlow} />
      <View style={styles.creamGlow} />
      <View style={styles.pinkWash} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  aquaGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 300,
    top: -90,
    left: -90,
    backgroundColor: pastelBackgroundTokens.aquaGlow,
  },
  creamGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 280,
    top: -84,
    right: -84,
    backgroundColor: pastelBackgroundTokens.creamGlow,
  },
  pinkWash: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: -160,
    height: "72%",
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: pastelBackgroundTokens.pinkWash,
  },
});
