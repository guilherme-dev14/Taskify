import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageIcon } from "@heroicons/react/24/outline";

export const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("settings.language")}
        </h3>
      </div>

      <div className="space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${
                i18n.language === lang.code
                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                  : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span
              className={`
              font-medium
              ${
                i18n.language === lang.code
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
              }
            `}
            >
              {lang.name}
            </span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-blue-500">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
