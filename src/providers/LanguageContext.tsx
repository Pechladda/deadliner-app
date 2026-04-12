import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { LANGUAGE_PROVIDER_ERROR } from "@/src/core/config";
import { initLanguage, LanguageCode, setLanguage } from "@/src/i18n";

type LanguageContextValue = {
  appLanguage: LanguageCode;
  language: LanguageCode;
  ready: boolean;
  setAppLanguage: (language: LanguageCode) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [appLanguage, setLanguageState] = useState<LanguageCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const resolvedLanguage = await initLanguage();
        setLanguageState(resolvedLanguage);
      } catch {
        setLanguageState("en");
      }

      setReady(true);
    })();
  }, []);

  const setAppLanguage = async (nextLanguage: LanguageCode) => {
    try {
      await setLanguage(nextLanguage);
      setLanguageState(nextLanguage);
    } catch {
      setLanguageState("en");
    }
  };

  const value = useMemo(
    () => ({ appLanguage, language: appLanguage, ready, setAppLanguage }),
    [appLanguage, ready],
  );

  if (!ready) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(LANGUAGE_PROVIDER_ERROR);
  }

  return context;
}
