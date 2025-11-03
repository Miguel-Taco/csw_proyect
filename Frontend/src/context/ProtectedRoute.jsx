// components/common/ProtectedRoute.jsx
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario está activo
  if (user?.active === false) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#ff9800', marginBottom: '16px' }}>⚠️ Cuenta Inactiva</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Su cuenta ha sido desactivada. Contacte al administrador.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles si se especificaron
  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      const dashboardRoutes = {
        estudiante: '/seccionesPage',
        profesor: '/seccionesPage'
      };
      
      const userDashboard = dashboardRoutes[userRole];
      
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#f44336', marginBottom: '16px' }}>🚫 Acceso Denegado</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>
              No tiene permisos para acceder a esta sección.
            </p>
            <p style={{ color: '#999', marginBottom: '24px' }}>
              Su rol actual: <strong>{user.role}</strong>
            </p>
            <button 
              onClick={() => navigate(userDashboard || '/seccionesPage')}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Ir a mi dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Si pasa todas las validaciones, mostrar el contenido protegido
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

ProtectedRoute.defaultProps = {
  allowedRoles: []
};

export default ProtectedRoute;