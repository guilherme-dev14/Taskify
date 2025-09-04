import api from "../api";
import type { IUser, IUpdateProfileRequest, IUserStats, IChangePasswordRequest } from "../../types/auth.types";

class UserService {
  async getCurrentUser(): Promise<IUser> {
    const response = await api.get<IUser>("/users/profile");
    return response.data;
  }

  async updateProfile(data: IUpdateProfileRequest): Promise<IUser> {
    const response = await api.put<IUser>("/users/updateUser", data);
    return response.data;
  }

  async getUserStats(): Promise<IUserStats> {
    const response = await api.get<IUserStats>("/users/stats");
    return response.data;
  }

  async changePassword(data: IChangePasswordRequest): Promise<void> {
    await api.put("/users/change-password", data);
  }

  async deleteAccount(): Promise<void> {
    await api.delete("/users/deleteProfile");
  }
}

export default new UserService();
