import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Importa tus páginas
import LoginPage from "../paginas/Login";
import RegisterPage from "../paginas/Register";
import SeccionesPage from "../paginas/SeccionesPage";
import TareasIndividualesPage from "../paginas/TareasIndividualesPage";
import CrearTareaPage from "../paginas/CrearTareaPage";
import AlumnoPage from "../paginas/AlumnoPage";

// --- Componentes de Control de Rutas ---

// Rutas protegidas con control de roles
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles permitidos, verificar
  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      // Redirigir al dashboard correspondiente según el rol
      if (userRole === 'estudiante' || userRole === 'alumno') {
        return <Navigate to="/hola" replace />;
      } else if (userRole === 'profesor') {
        return <Navigate to="/seccionesPage" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

// Rutas públicas (login, register)
function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (isAuthenticated) {
    // Redirigir según el rol del usuario
    const userRole = user?.role?.toLowerCase();
    
    if (userRole === 'estudiante' || userRole === 'alumno') {
      return <Navigate to="/hola" replace />;
    } else if (userRole === 'profesor') {
      return <Navigate to="/seccionesPage" replace />;
    }
    
    return <Navigate to="/seccionesPage" replace />;
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

        {/* Ruta raíz - redirige según autenticación */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RedirectToDashboard />
            </ProtectedRoute>
          }
        />

        {/* Página del Alumno/Estudiante */}
        <Route
          path="/alumnosPage"
          element={
            <ProtectedRoute allowedRoles={['alumno']}>
              <AlumnoPage />
            </ProtectedRoute>
          }
        />

        {/* Página de Secciones del Profesor */}
        <Route
          path="/seccionesPage"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <SeccionesPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas dinámicas de Tareas (accesibles por profesor) */}
        <Route
          path="/secciones/:idSeccion/tareas"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <TareasIndividualesPage />
            </ProtectedRoute>
          }
        />

        {/* Crear tarea en una sección */}
        <Route
          path="/secciones/:idSeccion/crear-tarea"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
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

// Componente helper para redirigir al dashboard correcto
function RedirectToDashboard() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase();

  if (userRole === 'estudiante' || userRole === 'alumno') {
    return <Navigate to="/alumnosPage" replace />;
  } else if (userRole === 'profesor') {
    return <Navigate to="/seccionesPage" replace />;
  }

  return <Navigate to="/seccionesPage" replace />;
}

export default AppRouter;