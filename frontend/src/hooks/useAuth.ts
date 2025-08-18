import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../services/auth.store";

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  };

  return {
    user,
    isAuthenticated,
    requireAuth,
  };
};
