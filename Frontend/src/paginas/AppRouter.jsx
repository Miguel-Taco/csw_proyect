import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useAuth } from "../context/AuthContext";

// Importa tus páginas
import LoginPage from "../paginas/Login";
import RegisterPage from "../paginas/Register";
import SeccionesPage from "../paginas/SeccionesPage";
import TareasIndividualesPage from "../paginas/TareasIndividualesPage";
import CrearTareaPage from "../paginas/CrearTareaPage";
import AsignacionGruposPage from "../paginas/AsignacionGruposPage";
import VerGrupoAlumno from "../paginas/VerGrupoAlumno"; 
import AsignarNotas from "../paginas/AsignarNotas";
import AlumnoPage from "../paginas/AlumnoPage";
import TareasAlumno from '../paginas/TareasAlumno';
import AsignarNotasGrupales from '../paginas/AsignarNotasGrupales';

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
        return <Navigate to="/alumnosPage" replace />;
      } else if (userRole === 'profesor') {
        return <Navigate to="/seccionesPage" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

ProtectedRoute.defaultProps = {
  allowedRoles: []
};

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
      return <Navigate to="/alumnosPage" replace />;
    } else if (userRole === 'profesor') {
      return <Navigate to="/seccionesPage" replace />;
    }
    
    return <Navigate to="/seccionesPage" replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
};

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

        {/* ===== RUTAS DEL ALUMNO ===== */}
        
        {/* Página principal del alumno */}
        <Route
          path="/alumnosPage"
          element={
            <ProtectedRoute allowedRoles={['alumno']}>
              <AlumnoPage />
            </ProtectedRoute>
          }
        />

        {/* Ver tareas de una sección (alumno) */}
        <Route
          path="/alumno/seccion/:idSeccion/tareas"
          element={
            <ProtectedRoute allowedRoles={['alumno']}>
              <TareasAlumno />
            </ProtectedRoute>
          }
        />

         {/* Ver información del grupo (alumno) */}
        <Route
          path="/alumno/seccion/:idSeccion/ver-grupo"
          element={
            <ProtectedRoute allowedRoles={['alumno']}>
              <VerGrupoAlumno />
            </ProtectedRoute>
          }
        /> 

        {/* ===== RUTAS DEL PROFESOR ===== */}
        
        {/* Página de secciones del profesor */}
        <Route
          path="/seccionesPage"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <SeccionesPage />
            </ProtectedRoute>
          }
        />

        {/* Ver tareas y alumnos de una sección (profesor) */}
        <Route
          path="/secciones/:idSeccion/tareas"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <TareasIndividualesPage />
            </ProtectedRoute>
          }
        />

        {/* Crear tarea en una sección (profesor) */}
        <Route
          path="/secciones/:idSeccion/crear-tarea"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <CrearTareaPage />
            </ProtectedRoute>
          }
        />

        {/* Asignar grupos en una sección (profesor) */}
        <Route
          path="/asignacion-grupos"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <AsignacionGruposPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ CORREGIDO: Ruta usando el componente correcto */}
        <Route
          path="/secciones/:idSeccion/ver-grupos"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <VerGrupoAlumno />
            </ProtectedRoute>
          }
        />

        {/* Asignar notas a un alumno específico (profesor) */}
        <Route
          path="/secciones/:idSeccion/alumno/:idAlumno/tareas"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <AsignarNotas />
            </ProtectedRoute>
          }
        />

        {/* Asignar notas grupales (profesor) */}
        <Route
          path="/secciones/:idSeccion/grupo/:idGrupo/tareas"
          element={
            <ProtectedRoute allowedRoles={['profesor']}>
              <AsignarNotasGrupales />
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