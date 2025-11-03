import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
  	throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'http://localhost:8080';
  // base de datos de nuestro repositorio, fue desplegada en railway y este es el url

  // Restaurar sesión al cargar la app
  useEffect(() => {
  	const initAuth = () => {
  	  try {
  	  	const savedUser = localStorage.getItem('currentUser');
  	  	
  	  	if (savedUser) {
  	  	  const userData = JSON.parse(savedUser);
  	  	  const savedToken = localStorage.getItem('authToken') || userData.token;
  	  	  
  	  	  setUser({ ...userData, token: savedToken });
  	  	  console.log('Sesión restaurada:', userData);
  	  	} else {
  	  	  console.log('No hay sesión guardada');
  	  	}
  	  } catch (error) {
  	  	console.error('Error al restaurar sesión:', error);
  	  	localStorage.removeItem('currentUser');
  	  	localStorage.removeItem('authToken');
  	  } finally {
  	  	setLoading(false);
  	  }
  	};

  	initAuth();
  }, []);

  // Sincronización entre pestañas
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'currentUser') {
        if (event.newValue) {
          try {
            const newUserData = JSON.parse(event.newValue);
            const newToken = localStorage.getItem('authToken') || newUserData.token;
            setUser({ ...newUserData, token: newToken });
          } catch (error) {
             console.error('Error al parsear usuario desde storage', error);
          }
        } else {
          // Se cerró sesión en otra pestaña
          setUser(null);
        }
      }
    };

    globalThis.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      globalThis.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = useCallback(async (credentials) => {
  	try {
  	  const response = await fetch(`${BASE_URL}/auth/login`, {
  	  	method: 'POST',
  	  	mode: 'cors',
  	  	headers: {
  	  	  'Content-Type': 'application/json',
  	  	  'Accept': 'application/json',
  	  	},
  	  	body: JSON.stringify({
  	  	  email: credentials.username,
  	  	  password: credentials.password
  	  	})
  	  });

  	  const data = await response.json();
  	  console.log("Respuesta completa del backend:", data);

  	  if (response.ok && data.success === true) {
  	  	let userData = data.user || {};
  	  	
  	  	const token = data.token || data.accessToken || null;

  	  	const userSession = {
  	  	  id: userData.idPersona,
  	  	  username: userData.correo,
  	  	  role: userData.tipo,
  	  	  email: userData.correo,
  	  	  nombres: userData.nombres,
  	  	  apellidoP: userData.apellidoP,
  	  	  apellidoM: userData.apellidoM,
  	  	  active: userData.active !== false,
          // Aseguramos que el token también esté en el objeto de estado
          token: token 
  	  	};
  	  	
  	  	setUser(userSession);
  	  	
  	  	localStorage.setItem('currentUser', JSON.stringify(userSession));
  	  	if (token) {
  	  	  localStorage.setItem('authToken', token);
  	  	}
  	  	
  	  	return { 
  	  	  success: true, 
  	  	  user: userSession, 
  	  	  message: data.message || 'Login exitoso'
  	  	};
  	  } else {
  	  	return { 
  	  	  success: false, 
  	  	  message: data.message || data.detail || data.error || 'Credenciales inválidas' 
  	  	};
  	  }
  	} catch (error) {
  	  console.error("Error en login:", error);
  	  return { 
  	  	success: false, 
  	  	message: 'Error de conexión. Verifique su conexión a internet.' 
  	  };
  	}
  }, []); // `login` no depende de `user` o `loading`, por lo que su array de dependencias está vacío.

  const logout = useCallback(async () => {
  	try {
      // Leemos el token del estado 'user' o del localStorage como fallback
  	  const token = user?.token || localStorage.getItem('authToken');
  	  
  	  if (token) {
  	  	await fetch(`${BASE_URL}/auth/logout`, {
  	  	  method: 'POST',
  	  	  mode: 'cors',
  	  	  headers: {
  	  	  	'Authorization': `Bearer ${token}`,
  	  	  	'Content-Type': 'application/json',
  	  	  }
  	  	}).catch(() => {
  	  	  console.log('No se pudo notificar logout al backend');
  	  	});
  	  }
  	} catch (error) {
  	  console.error('Error en logout:', error);
  	} finally {
  	  // Limpiar
  	  setUser(null);
  	  localStorage.removeItem('currentUser');
  	  localStorage.removeItem('authToken');
  	}
  }, [user]); // `logout` depende de `user` para obtener el token.

  const hasRole = useCallback((role) => {
  	return user?.role?.toLowerCase() === role.toLowerCase();
  }, [user]); // `hasRole` depende de `user`.

  const updateUser = useCallback((userData) => {
  	const updatedUser = { ...user, ...userData };
  	setUser(updatedUser);
  	localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }, [user]); // `updateUser` depende de `user`.

  // Ahora memorizamos el objeto 'value'
  // Solo se creará un nuevo objeto si 'user' o 'loading' cambian.
  const value = useMemo(() => ({
  	user,
  	login,
  	logout,
  	hasRole,
  	updateUser,
  	isAuthenticated: !!user,
  	loading
  }), [user, loading, login, logout, hasRole, updateUser]);

  return (
  	<AuthContext.Provider value={value}>
  	  {children}
  	</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
