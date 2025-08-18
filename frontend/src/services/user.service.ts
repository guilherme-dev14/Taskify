import api from "./api";
import type { User, UpdateProfileRequest } from "../types/auth.types";

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/users/profile");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put<User>("/users/updateUser", data);
    return response.data;
  }
}

export default new UserService();
