import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    initLanguage,
    LanguageCode,
    setLanguage,
} from "@/src/core/utils/translations";

type LanguageContextValue = {
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
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const resolvedLanguage = await initLanguage();
      setLanguageState(resolvedLanguage);
      setReady(true);
    })();
  }, []);

  const setAppLanguage = async (nextLanguage: LanguageCode) => {
    await setLanguage(nextLanguage);
    setLanguageState(nextLanguage);
  };

  const value = useMemo(
    () => ({ language, ready, setAppLanguage }),
    [language, ready],
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
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
