import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Card, IconButton, Input } from "@/src/components";
import { t } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { auth, db } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import { colors, radius, spacing, typography } from "@/src/theme";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type UserProfile = {
  username?: string;
  name?: string;
};

const PROFILE_LOAD_ERROR = "Unable to load profile. Please sign in again.";

export function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
  const navigation = useSettingsNavigation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const displayLoadError = useMemo(() => {
    const normalized = loadError.toLowerCase();

    if (
      normalized.includes("permission denied") ||
      normalized.includes("sign in again") ||
      normalized.includes("session expired")
    ) {
      return "Unable to load profile. Please sign in again.";
    }

    return loadError || PROFILE_LOAD_ERROR;
  }, [loadError]);

  const showSignInAgain = useMemo(() => {
    const normalized = loadError.toLowerCase();
    return (
      normalized.includes("permission denied") ||
      normalized.includes("sign in again") ||
      normalized.includes("session expired")
    );
  }, [loadError]);

  const loadProfile = async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      console.warn("[Profile] auth is missing after hydration");
      setLoadError("Please sign in again.");
      setIsLoading(false);
      return;
    }

    if (!currentUser) {
      console.warn("[Profile] currentUser is null after hydration");
      setLoadError("Please sign in again.");
      setIsLoading(false);
      return;
    }

    try {
      const fallbackUsername = currentUser.displayName?.trim() || "";
      const authEmail = auth.currentUser?.email ?? currentUser.email ?? "";

      setIsLoading(true);
      setLoadError("");
      setEmail(authEmail);

      const profileRef = doc(db, "users", currentUser.uid);
      const snapshot = await getDoc(profileRef);
      let nextUsername = fallbackUsername;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        nextUsername =
          data.username?.trim() || data.name?.trim() || fallbackUsername;
      }

      setUsername(nextUsername);
    } catch (error) {
      console.error("[Profile] failed:", error);
      setLoadError(PROFILE_LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void loadProfile();
  }, [currentUser, isHydrated, isAuthenticated]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
      >
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title">{t("profile")}</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[
            styles.contentInner,
            isCompact && styles.contentInnerCompact,
            isWide && styles.contentInnerWide,
          ]}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textSecondary} />
          </View>

          <Card style={styles.formCard}>
            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primaryStrong} />
              </View>
            ) : null}

            {loadError ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorBannerRow}>
                  <Ionicons
                    name="warning-outline"
                    size={16}
                    color={colors.danger}
                  />
                  <AppText variant="caption" style={styles.errorBannerText}>
                    {displayLoadError}
                  </AppText>
                </View>

                {showSignInAgain ? (
                  <Pressable
                    onPress={() => {
                      void signOut(auth);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in again"
                    style={styles.errorActionButton}
                  >
                    <AppText style={styles.errorActionText}>
                      Sign in again
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <View style={styles.formWrap}>
              <Input
                label={t("usernamePlaceholder")}
                value={username}
                editable={false}
                inputStyle={[
                  styles.readOnlyInput,
                  styles.profileInput,
                  isCompact && styles.profileInputCompact,
                ]}
              />
              <Input
                label={t("email")}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
                inputStyle={[
                  styles.readOnlyInput,
                  styles.profileInput,
                  isCompact && styles.profileInputCompact,
                ]}
              />
            </View>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    gap: spacing.m,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  headerSpacer: { width: 38, height: 38 },
  contentInner: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: spacing.m,
  },
  contentInnerCompact: {
    maxWidth: 360,
  },
  contentInnerWide: {
    maxWidth: 460,
  },
  avatar: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    marginBottom: -spacing.s,
  },
  formCard: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceWarm,
    gap: spacing.m,
    padding: spacing.l,
  },
  formWrap: { gap: spacing.s },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.s,
  },
  errorBanner: {
    borderRadius: 14,
    backgroundColor: colors.surfacePink,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    gap: spacing.xs,
  },
  errorBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorBannerText: {
    color: colors.danger,
    flexShrink: 1,
    lineHeight: 16,
  },
  errorActionButton: {
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  errorActionText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  readOnlyInput: {
    backgroundColor: colors.surfaceMint,
    color: colors.textSecondary,
    borderColor: colors.borderSoft,
  },
  profileInput: {
    minHeight: 50,
    borderRadius: radius.xxl,
    fontSize: typography.size.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  profileInputCompact: {
    minHeight: 46,
    fontSize: typography.size.xs,
  },
});
