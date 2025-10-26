import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css"

function Login(){
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({correo: "", contraseña: ""});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const pruebaInputs = () => {
        console.log("Datos de los inputs:", formData);
    };

    return(
        <div className="login-body">
            <div className="login-main-container">
                <h2>Login</h2>
                <div className="login-input-container">
                    <input type="text" placeholder="Correo" value={formData.correo} name="correo" onChange={handleChange}/>
                    <i className="fas fa-user"></i>
                </div>
                <div className="login-input-container">
                    <input  type={showPassword ? "text" : "password"} placeholder="Contraseña" name="contraseña" value={formData.contraseña} onChange={handleChange}/>
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}  
                    ></i>
                </div>
                <Link to="/seccionesPage" className="login-button">
                    Log in
                </Link>
                {/* Enlace de prueba para abrir directamente la página de Asignación de Grupos */}
                <Link to="/asignacionGrupos" className="login-button" style={{ marginTop: 8, display: 'inline-block', backgroundColor: '#313423', color: '#f4f4ec', padding: '8px 12px', borderRadius: 6, textDecoration: 'none' }}>
                    Ir a Asignación Grupos (TEST)
                </Link>
                <Link to="/register" className="login-registrar">
                     No tiene cuenta? Regístrese aquí!
                </Link>
            </div>
        </div>

    );
}

export default Login;