import { Routes, Route } from "react-router-dom";
import { Home } from "./view/Home/index";
import { Login } from "./view/Home/Login/login";
import { Register } from "./view/Home/Register/register";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};
