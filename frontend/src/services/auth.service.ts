import api from "./api";
import type {
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
} from "../types/auth.types";
import { setToken, removeToken } from "../utils/token.utils";

class AuthService {
  async login(data: ILoginRequest): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>("/auth/login", data);
    setToken(response.data.token);
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
}

export default new AuthService();
