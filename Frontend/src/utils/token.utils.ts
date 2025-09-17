import Cookies from "js-cookie";

const TOKEN_KEY = "jwt_token";

export const setToken = (token: string, rememberMe: boolean = false): void => {
  const expires = rememberMe ? 30 : 1;

  Cookies.set(TOKEN_KEY, token, {
    expires,
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });
};

export const getToken = (): string | undefined => {
  const token = Cookies.get(TOKEN_KEY);
  if (
    !token ||
    token.trim() === "" ||
    token === "undefined" ||
    token === "null"
  ) {
    return undefined;
  }
  return token;
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};
