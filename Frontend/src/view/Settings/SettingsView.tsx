/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  BellIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../services/auth.store";
import { useLanguage, useI18nTranslation } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import type { UserSettings } from "../../services/Settings/settings.service";
import settingsService from "../../services/Settings/settings.service";
import userService from "../../services/User/user.service";

interface Setting {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "input" | "button";
  value?: any;
  options?: { label: string; value: string }[];
}

const SettingsView: React.FC = () => {
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useI18nTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme,
    language: language,
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    taskReminders: true,
    teamUpdates: false,
  });
  const [, setLoading] = useState(true);
  const [, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
        setTheme(userSettings.theme as any);
        setLanguage(userSettings.language as any);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [setTheme, setLanguage]);

  const handleSettingChange = async (settingId: string, value: any) => {
    const newSettings = { ...settings, [settingId]: value };
    setSettings(newSettings);

    if (settingId === "theme") {
      setTheme(value);
    }

    if (settingId === "language") {
      setLanguage(value);
    }

    try {
      setSaveStatus("saving");
      await settingsService.updateUserSettings({ [settingId]: value });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save setting:", error);
      setSaveStatus("error");
      setSettings(settings);
      if (settingId === "theme") {
        setTheme(settings.theme as any);
      }
      if (settingId === "language") {
        setLanguage(settings.language as any);
      }
    }
  };

  const tabs = [
    { id: "general", label: t("settings.general"), icon: Cog6ToothIcon },
    { id: "appearance", label: t("settings.appearance"), icon: PaintBrushIcon },
    { id: "notifications", label: t("settings.notifications"), icon: BellIcon },
    { id: "data", label: t("settings.dataAccount"), icon: ArchiveBoxIcon },
  ];

  const generalSettings: Setting[] = [
    {
      id: "language",
      label: t("settings.language"),
      description: t("settings.languageDescription"),
      type: "select",
      value: settings.language,
      options: [
        { label: "English", value: "en" },
        { label: "Português", value: "pt" },
        { label: "Español", value: "es" },
        { label: "Français", value: "fr" },
      ],
    },
  ];

  const appearanceSettings: Setting[] = [
    {
      id: "theme",
      label: t("settings.theme"),
      description: t("settings.themeDescription"),
      type: "select",
      value: settings.theme,
      options: [
        { label: t("settings.system"), value: "system" },
        { label: t("settings.light"), value: "light" },
        { label: t("settings.dark"), value: "dark" },
      ],
    },
  ];

  const notificationSettings: Setting[] = [
    {
      id: "emailNotifications",
      label: t("settings.emailNotifications"),
      description: t("settings.emailNotificationsDescription"),
      type: "toggle",
      value: settings.emailNotifications,
    },
    {
      id: "pushNotifications",
      label: t("settings.pushNotifications"),
      description: t("settings.pushNotificationsDescription"),
      type: "toggle",
      value: settings.pushNotifications,
    },
    {
      id: "taskReminders",
      label: t("settings.taskReminders"),
      description: t("settings.taskRemindersDescription"),
      type: "toggle",
      value: settings.taskReminders,
    },
    {
      id: "teamUpdates",
      label: t("settings.teamUpdates"),
      description: t("settings.teamUpdatesDescription"),
      type: "toggle",
      value: settings.teamUpdates,
    },
    {
      id: "weeklyReports",
      label: t("settings.weeklyReports"),
      description: t("settings.weeklyReportsDescription"),
      type: "toggle",
      value: settings.weeklyReports,
    },
  ];

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case "toggle":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={setting.value}
              onChange={(e) =>
                handleSettingChange(setting.id, e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        );

      case "select":
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "input":
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const renderSettingsSection = (title: string, settingsArray: Setting[]) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="space-y-4">
        {settingsArray.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {setting.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {setting.description}
              </p>
            </div>
            <div className="ml-4">{renderSettingInput(setting)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderSettingsSection(t("settings.generalSettings"), generalSettings);

      case "appearance":
        return renderSettingsSection(t("settings.appearanceSettings"), appearanceSettings);

      case "notifications":
        return renderSettingsSection(
          t("settings.notificationSettings"),
          notificationSettings
        );
      case "data":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("settings.dataAccount")}
            </h3>

            {/* Danger Zone */}
            <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  {t("settings.dangerZone")}
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    {t("settings.deleteAccount")}
                  </h5>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {t("settings.deleteAccountDescription")}
                  </p>

                  {!showDangerZone ? (
                    <button
                      onClick={() => setShowDangerZone(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      {t("settings.deleteAccountButton")}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                          {t("settings.deleteConfirmation")}
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) =>
                            setDeleteConfirmation(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                          placeholder="DELETE"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (deleteConfirmation === "DELETE") {
                              try {
                                await userService.deleteAccount();
                                logout();
                              } catch (error) {
                                console.error(
                                  "Failed to delete account:",
                                  error
                                );
                              }
                            }
                          }}
                          disabled={deleteConfirmation !== "DELETE"}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <CheckIcon className="w-4 h-4" />
                          {t("settings.confirmDelete")}
                        </button>
                        <button
                          onClick={() => {
                            setShowDangerZone(false);
                            setDeleteConfirmation("");
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("settings.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("settings.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden sticky top-8">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  {t("settings.quickActions")}
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm text-red-600 dark:text-red-400"
                  >
                    {t("settings.signOut")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              {renderTabContent()}

              {/* Save Button */}
              {activeTab !== "data" && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("settings.changesSaved")}
                    </p>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{t("settings.saved")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
