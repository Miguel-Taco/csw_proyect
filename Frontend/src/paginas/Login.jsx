import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Ajusta la ruta
import "../styles/Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ correo: "", contraseña: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // Usar el contexto

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correo || !formData.contraseña) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);
    try {
      // Usar la función login del contexto
      const result = await login(
        { 
          username: formData.correo, 
          password: formData.contraseña 
        },
        'profesor' // Cambia esto según el rol que necesites: 'profesor', 'alumno', 'admin', etc.
      );

      if (result.success) {
        navigate("/seccionesPage");
      } else {
        setError(result.message || "Credenciales inválidas");
      }
    } catch (err) {
      console.error("Error login:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-main-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-input-container">
            <input
              type="text"
              placeholder="Correo"
              value={formData.correo}
              name="correo"
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
            />
            <i className="fas fa-user"></i>
          </div>
          <div className="login-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
            />
            <i
              className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            ></i>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Log in"}
          </button>
        </form>

        <Link to="/register" className="login-registrar">
          ¿No tiene cuenta? Regístrese aquí!
        </Link>
      </div>
      <p>correo y contraseña del profe: profe1 <br/>correo y contraseña del alumno: alumno1 <br/> el backend esta alojado en: https://cswproyect-production.up.railway.app/ <br/>tanto la bd y el backend estan deployados en railway</p>
    </div>
  );
}

export default Login;