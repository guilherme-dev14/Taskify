/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslation as useI18nTranslation } from "react-i18next";

type Language = "en" | "pt" | "es" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { i18n } = useI18nTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "en";
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language, i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
export { useTranslation as useI18nTranslation } from "react-i18next";
