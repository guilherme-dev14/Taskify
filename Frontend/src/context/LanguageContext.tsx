/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

const translations = {
  en: {
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
    dashboard: "Dashboard",
    tasks: "Tasks",
    calendar: "Calendar",
  },
  pt: {
    welcome: "Bem-vindo",
    profile: "Perfil",
    settings: "Configurações",
    dashboard: "Dashboard",
    tasks: "Tarefas",
    calendar: "Calendário",
  },
  es: {
    welcome: "Bienvenido",
    profile: "Perfil",
    settings: "Configuraciones",
    dashboard: "Dashboard",
    tasks: "Tareas",
    calendar: "Calendario",
  },
  fr: {
    welcome: "Bienvenue",
    profile: "Profil",
    settings: "Paramètres",
    dashboard: "Tableau de bord",
    tasks: "Tâches",
    calendar: "Calendrier",
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

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

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t, language };
};
