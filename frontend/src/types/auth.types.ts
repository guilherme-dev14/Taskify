export interface ILoginRequest {
  preventDefault(): unknown;
  email: string;
  password: string;
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
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
}
