import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../paginas/Login";
import Register from "../paginas/Register";
import Dashboard from "../paginas/SeccionesPage";
import AsignacionGrupos from "../paginas/AsignacionGruposPage";
import SubirTareas from "../paginas/SubirTareas";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seccionesPage" element={<Dashboard />} />
        <Route path="/asignacionGrupos" element={<AsignacionGrupos />} />
        <Route path="/asignaciongrupos" element={<AsignacionGrupos />} />
        <Route path="/AsignacionGrupos" element={<AsignacionGrupos />} />
        <Route path="/subirTareas" element={<SubirTareas />} />
        <Route path="/subirtareas" element={<SubirTareas />} />
        <Route path="*" element={
          <div style={{ padding: 24, color: 'red', fontSize: 20 }}>
            ❌ Ruta no encontrada
            <br/><a href="/">Ir a inicio</a>
            <br/><a href="/asignacionGrupos">Ir a Asignación Grupos</a>
            <br/><a href="/subirTareas">Ir a Subir Tareas</a>
          </div>
        } />
      </Routes>
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default AppRouter;
