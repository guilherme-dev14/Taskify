import Cookies from "js-cookie";

const TOKEN_KEY = "jwt_token";

export const setToken = (token: string, rememberMe: boolean = false): void => {
  const expires = rememberMe ? 30 : 1; // 30 days if remember me, otherwise 1 day
  
  Cookies.set(TOKEN_KEY, token, {
    expires,
    secure: window.location.protocol === 'https:',
    sameSite: "strict",
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};
