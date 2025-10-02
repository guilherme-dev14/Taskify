import api from "../api";

interface UserSettings {
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  taskReminders: boolean;
  teamUpdates: boolean;
}

class SettingsService {
  async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await api.get<UserSettings>("/users/settings");
      return response.data;
    } catch {
      return {
        theme: "system",
        language: "en",
        timezone: "UTC-3",
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        taskReminders: true,
        teamUpdates: false,
        autoSave: true,
        compactView: false,
        defaultWorkspace: "personal",
        taskAutoAssign: false,
        workspacePrivacy: "private",
      };
    }
  }

  async updateUserSettings(
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    const response = await api.put<UserSettings>("/users/settings", settings);
    return response.data;
  }

  async exportUserData(): Promise<Blob> {
    const response = await api.get("/users/export", { responseType: "blob" });
    return response.data;
  }

  async clearCache(): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();
  }
}

export default new SettingsService();
export type { UserSettings };
