import Cookies from "js-cookie";

const TOKEN_KEY = "jwt_token";

export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1, // 1 dia
    secure: true,
    sameSite: "strict",
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};
