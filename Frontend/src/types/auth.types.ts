export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  password: string;
}

export interface IUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  createdAt?: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
}

export interface IUserStats {
  tasksCompleted: number;
  projectsActive: number;
  teamMembers: number;
  totalWorkspaces: number;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IUserSettings {
  id?: number;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  emailNotifications?: boolean;
  taskReminders?: boolean;
  weekStartsOn?: number; // 0 for Sunday, 1 for Monday
}
