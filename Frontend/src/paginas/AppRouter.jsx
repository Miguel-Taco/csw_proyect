import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Importa tus páginas
import LoginPage from "../paginas/Login";
import RegisterPage from "../paginas/Register";
import SeccionesPage from "../paginas/SeccionesPage";
import TareasPage from "../paginas/TareasIndividualesPage";
import CrearTareaPage from "../paginas/CrearTareaPage";

// --- Componentes de Control de Rutas ---

// Componente para proteger rutas que solo usuarios autenticados pueden ver.
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Componente para rutas públicas que un usuario autenticado no debería ver (como login).
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si ya está autenticado, lo mandamos a la página principal.
  if (isAuthenticated) {
    return <Navigate to="/secciones" replace />;
  }

  return children;
}


// --- Enrutador Principal de la Aplicación ---

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Rutas Protegidas */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {/* Redirige la ruta raíz a la página de secciones por defecto */}
              <Navigate to="/secciones" replace />
            </ProtectedRoute>
          } 
        /> 
        <Route path="/secciones" element={<ProtectedRoute><SeccionesPage /></ProtectedRoute>} />
        <Route path="/tareas" element={<ProtectedRoute><TareasPage /></ProtectedRoute>} />
        <Route path="/crear-tarea" element={<ProtectedRoute><CrearTareaPage /></ProtectedRoute>} />

        {/* Para ver las rutas de arriba tienes que loguearte con profe1 y busca esa ruta */}

        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;