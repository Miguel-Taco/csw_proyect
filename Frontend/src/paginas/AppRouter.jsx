import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Importa tus páginas
import LoginPage from "../paginas/Login";
import RegisterPage from "../paginas/Register";
import SeccionesPage from "../paginas/SeccionesPage";
import TareasIndividualesPage from "../paginas/TareasIndividualesPage";
import CrearTareaPage from "../paginas/CrearTareaPage";
import InvitacionesPendientesButton from "../componentes/InvitacionesPendientesButton";
// --- Componentes de Control de Rutas ---

// Rutas protegidas (solo usuarios autenticados)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Rutas públicas (login, register)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/secciones" replace />;
  }

  return children;
}

// --- Enrutador Principal ---

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Rutas Protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/secciones" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secciones"
          element={
            <ProtectedRoute>
              <InvitacionesPendientesButton />
              <SeccionesPage />
            </ProtectedRoute>
          }
        />

        {/* Ver alumnos y tareas de una sección */}
        <Route
          path="/secciones/:idSeccion/tareas"
          element={
            <ProtectedRoute>
              <TareasIndividualesPage />
            </ProtectedRoute>
          }
        />

        {/* Crear tarea en una sección */}
        <Route
          path="/secciones/:idSeccion/crear-tarea"
          element={
            <ProtectedRoute>
              <CrearTareaPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ NUEVA RUTA: Ver tareas de un alumno específico en una sección */}
        <Route
          path="/secciones/:idSeccion/alumno/:idAlumno/tareas"
          element={
            <ProtectedRoute>
              {/* Aquí pondrás tu componente de tareas del alumno */}
              <div style={{ padding: '20px' }}>
                <h2>Vista de Tareas del Alumno</h2>
                <p>Próximamente: Aquí verás las tareas individuales del alumno</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
