import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "./view/Home/index";
import { Login } from "./view/Home/Login/login";
import { Register } from "./view/Home/Register/register";
import ForgotPassword from "./view/Home/ForgotPassword/ForgotPassword";
import { Dashboard } from "./view/Dashboard/Dashboard";
import { WorkspaceManagement } from "./view/WorkspaceManagement/WorkspaceManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./services/auth.store";
export const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute> {<Dashboard />} </ProtectedRoute>}
      />
      <Route
        path="/workspaces"
        element={<ProtectedRoute> {<WorkspaceManagement />} </ProtectedRoute>}
      />
    </Routes>
  );
};
