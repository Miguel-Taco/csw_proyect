import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../paginas/Login";
import Register from "../paginas/Register";
import Dashboard from "../paginas/SeccionesPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seccionesPage" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
