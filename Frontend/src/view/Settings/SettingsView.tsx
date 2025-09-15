/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../services/auth.store";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import type { UserSettings } from "../../services/Settings/settings.service";
import settingsService from "../../services/Settings/settings.service";
import { WorkspaceSettings } from "../../components/WorkspaceSettings/WorkspaceSettings";
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
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme,
    language: language,
    timezone: "UTC-3",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    taskReminders: true,
    teamUpdates: false,
    autoSave: true,
    compactView: false,
    showAvatars: true,
    defaultWorkspace: "personal",
    taskAutoAssign: false,
    workspacePrivacy: "private",
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
    { id: "general", label: "General", icon: Cog6ToothIcon },
    { id: "appearance", label: "Appearance", icon: PaintBrushIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheckIcon },
    { id: "workspace", label: "Workspace", icon: UserGroupIcon },
    { id: "data", label: "Data & Storage", icon: ArchiveBoxIcon },
  ];

  const generalSettings: Setting[] = [
    {
      id: "language",
      label: "Language",
      description: "Choose your preferred language",
      type: "select",
      value: settings.language,
      options: [
        { label: "English", value: "en" },
        { label: "Português", value: "pt" },
        { label: "Español", value: "es" },
        { label: "Français", value: "fr" },
      ],
    },
    {
      id: "timezone",
      label: "Timezone",
      description: "Set your local timezone",
      type: "select",
      value: settings.timezone,
      options: [
        { label: "UTC-3 (São Paulo)", value: "UTC-3" },
        { label: "UTC-5 (New York)", value: "UTC-5" },
        { label: "UTC+0 (London)", value: "UTC+0" },
        { label: "UTC+1 (Paris)", value: "UTC+1" },
      ],
    },
    {
      id: "autoSave",
      label: "Auto Save",
      description: "Automatically save your changes",
      type: "toggle",
      value: settings.autoSave,
    },
  ];

  const appearanceSettings: Setting[] = [
    {
      id: "theme",
      label: "Theme",
      description: "Choose your preferred theme",
      type: "select",
      value: settings.theme,
      options: [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
    },
    {
      id: "compactView",
      label: "Compact View",
      description: "Use a more compact layout to show more content",
      type: "toggle",
      value: settings.compactView,
    },
    {
      id: "showAvatars",
      label: "Show Avatars",
      description: "Display profile pictures in task cards",
      type: "toggle",
      value: settings.showAvatars,
    },
  ];

  const notificationSettings: Setting[] = [
    {
      id: "emailNotifications",
      label: "Email Notifications",
      description: "Receive notifications via email",
      type: "toggle",
      value: settings.emailNotifications,
    },
    {
      id: "pushNotifications",
      label: "Push Notifications",
      description: "Receive browser push notifications",
      type: "toggle",
      value: settings.pushNotifications,
    },
    {
      id: "taskReminders",
      label: "Task Reminders",
      description: "Get reminded about upcoming deadlines",
      type: "toggle",
      value: settings.taskReminders,
    },
    {
      id: "teamUpdates",
      label: "Team Updates",
      description: "Notifications about team activity",
      type: "toggle",
      value: settings.teamUpdates,
    },
    {
      id: "weeklyReports",
      label: "Weekly Reports",
      description: "Receive weekly productivity summaries",
      type: "toggle",
      value: settings.weeklyReports,
    },
  ];

  const privacySettings: Setting[] = [
    {
      id: "workspacePrivacy",
      label: "Default Workspace Privacy",
      description: "Privacy level for new workspaces",
      type: "select",
      value: settings.workspacePrivacy,
      options: [
        { label: "Private", value: "private" },
        { label: "Team Only", value: "team" },
        { label: "Public", value: "public" },
      ],
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
        return renderSettingsSection("General Settings", generalSettings);

      case "appearance":
        return renderSettingsSection("Appearance Settings", appearanceSettings);

      case "notifications":
        return renderSettingsSection(
          "Notification Settings",
          notificationSettings
        );

      case "privacy":
        return renderSettingsSection(
          "Privacy & Security Settings",
          privacySettings
        );

      case "workspace":
        return (
          <div className="space-y-6">
            <WorkspaceSettings />
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data & Storage
            </h3>

            {/* Data Export */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Export Your Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download a copy of all your data including tasks, workspaces,
                and settings.
              </p>
              <button
                onClick={async () => {
                  try {
                    const blob = await settingsService.exportUserData();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "taskify-data-export.json";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error("Failed to export data:", error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Export Data
              </button>
            </div>

            {/* Clear Cache */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Clear Local Cache
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Clear your browser's local cache to free up space and resolve
                issues.
              </p>
              <button
                onClick={async () => {
                  try {
                    await settingsService.clearCache();
                    alert("Cache cleared successfully!");
                  } catch (error) {
                    console.error("Failed to clear cache:", error);
                  }
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Clear Cache
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Danger Zone
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    Delete Account
                  </h5>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>

                  {!showDangerZone ? (
                    <button
                      onClick={() => setShowDangerZone(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                          Type "DELETE" to confirm:
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
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => {
                            setShowDangerZone(false);
                            setDeleteConfirmation("");
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Cancel
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
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your Taskify experience
          </p>
        </motion.div>

        {activeTab === "workspace" ? (
          <WorkspaceSettings />
        ) : (
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
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                      Reset to defaults
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-sm text-gray-700 dark:text-gray-300">
                      Import settings
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm text-red-600 dark:text-red-400"
                    >
                      Sign out
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
                        Changes are saved automatically
                      </p>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Saved</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
