import api from "./api";
import type { IUser, IUpdateProfileRequest } from "../types/auth.types";

class UserService {
  async getCurrentUser(): Promise<IUser> {
    const response = await api.get<IUser>("/users/profile");
    return response.data;
  }

  async updateProfile(data: IUpdateProfileRequest): Promise<IUser> {
    const response = await api.put<IUser>("/users/updateUser", data);
    return response.data;
  }
}

export default new UserService();
