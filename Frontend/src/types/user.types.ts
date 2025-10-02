export interface IUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserSummary {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IUserLoginRequest {
  email: string;
  password: string;
}

export interface IUserRegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserLoginResponse {
  token: string;
  user: IUser;
}

export interface IUpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
}

export const getFullName = (user: IUserSummary | IUser): string => {
  return user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "Unknown User";
};

export const getInitials = (user: IUserSummary | IUser): string => {
  return `${user.firstName?.charAt(0) || ""}${
    user.lastName?.charAt(0) || ""
  }`.toUpperCase();
};
