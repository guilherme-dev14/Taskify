import api from "../api";
import type {
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
} from "../../types/auth.types";
import { setToken, removeToken } from "../../utils/token.utils";

class AuthService {
  async login(
    data: ILoginRequest & { rememberMe?: boolean }
  ): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>("/auth/login", {
      email: data.email,
      password: data.password,
    });
    setToken(response.data.token, data.rememberMe);
    return response.data;
  }

  async register(data: IRegisterRequest): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>("/auth/register", data);
    return response.data;
  }

  logout(): void {
    removeToken();
    window.location.href = "/login";
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", { token, newPassword });
  }
}

export default new AuthService();
