import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "./view/Home/index";
import { Login } from "./view/Home/Login/login";
import { Register } from "./view/Home/Register/register";
import { Dashboard } from "./view/Dashboard/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./services/auth.store";
export const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute> {<Dashboard />} </ProtectedRoute>}
      />
    </Routes>
  );
};
