import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth.types";
import { setToken, removeToken } from "../utils/token.utils";

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    setToken(response.data.token);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    setToken(response.data.token);
    return response.data;
  }

  logout(): void {
    removeToken();
    window.location.href = "/login";
  }
}

export default new AuthService();
