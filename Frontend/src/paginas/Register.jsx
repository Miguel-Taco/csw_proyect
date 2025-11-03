import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState([false, false]);
    const [formData, setFormData] = useState({
        nombres: "",
        apellidoP: "",
        apellidoM: "",
        correo: "",
        contraseña: "",
        repetirContraseña: "",
        tipoUsuario: "Estudiante",
        codigoEstudiante: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const BASE_URL = 'https://cswproyect-production.up.railway.app';

    const togglePassword = (index) => {
        const newState = [...showPassword];
        newState[index] = !newState[index];
        setShowPassword(newState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTipoUsuarioChange = (tipo) => {
        setFormData(prev => ({
            ...prev,
            tipoUsuario: tipo,
            codigoEstudiante: tipo === "Profesor" ? "" : prev.codigoEstudiante
        }));
    };

    const handleCodigoChange = (e) => {
        const value = e.target.value.replaceAll(/\D/g, '');
        if (value.length <= 8) {
            setFormData(prev => ({ ...prev, codigoEstudiante: value }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.contraseña !== formData.repetirContraseña) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        
        const payload = {
            nombres: formData.nombres,
            apellidoP: formData.apellidoP,
            apellidoM: formData.apellidoM,
            correo: formData.correo,
            contrasena: formData.contraseña,
            tipoUsuario: formData.tipoUsuario,
            codigoEstudiante: formData.tipoUsuario === 'Estudiante' ? formData.codigoEstudiante : null
        };
        
        console.log("Enviando al backend:", JSON.stringify(payload, null, 2));

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Registro exitoso:", data);
                alert("¡Usuario registrado exitosamente!");
                navigate("/login");
            } else {
                const errorData = await response.json();
                setError(errorData.error || `Error ${response.status}: Ocurrió un problema con el registro.`);
            }

        } catch (err) {
            console.error("Error de conexión:", err);
            setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    };
    
    return(
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Crear Cuenta</h1>
                    <p>Completa tus datos para registrarte</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    
                    {/* Tipo de Usuario */}
                    <div className="form-group">
                        <p className="form-label" id="tipo-usuario-label" type="text">Tipo de Usuario</p>
                        <div className="user-type-grid" role="radiogroup" aria-labelledby="tipo-usuario-label">
                            <label className={`user-type-option ${formData.tipoUsuario === "Estudiante" ? "active" : ""}`}>
                                <input 
                                    type="radio" 
                                    name="tipoUsuario" 
                                    value="Estudiante"
                                    checked={formData.tipoUsuario === "Estudiante"}
                                    onChange={() => handleTipoUsuarioChange("Estudiante")}
                                    aria-label="Seleccionar Estudiante"
                                />
                                <span className="icon" aria-hidden="true">👨‍🎓</span>
                                <span>Estudiante</span>
                            </label>
                            <label className={`user-type-option ${formData.tipoUsuario === "Profesor" ? "active" : ""}`}>
                                <input 
                                    type="radio" 
                                    name="tipoUsuario" 
                                    value="Profesor"
                                    checked={formData.tipoUsuario === "Profesor"}
                                    onChange={() => handleTipoUsuarioChange("Profesor")}
                                    aria-label="Seleccionar Profesor"
                                />
                                <span className="icon" aria-hidden="true">👨‍🏫</span>
                                <span>Profesor</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Nombres */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="nombres">Nombres</label>
                        <input 
                            id="nombres"
                            type="text"
                            name="nombres"
                            className="form-input"
                            value={formData.nombres}
                            onChange={handleChange}
                            placeholder="Ingresa tus nombres"
                            required
                        />
                    </div>
                    
                    {/* Apellidos en grid */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="apellidoP">Apellido Paterno</label>
                            <input 
                                id="apellidoP"
                                type="text"
                                name="apellidoP"
                                className="form-input"
                                value={formData.apellidoP}
                                onChange={handleChange}
                                placeholder="Apellido paterno"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="apellidoM">Apellido Materno</label>
                            <input 
                                id="apellidoM"
                                type="text"
                                name="apellidoM"
                                className="form-input"
                                value={formData.apellidoM}
                                onChange={handleChange}
                                placeholder="Apellido materno"
                                required
                            />
                        </div>
                    </div>
                    
                    {/* Correo */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="correo">Correo Electrónico</label>
                        <input 
                            id="correo"
                            type="email"
                            name="correo"
                            className="form-input"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>
                    
                    {/* Código de Estudiante */}
                    {formData.tipoUsuario === "Estudiante" && (
                        <div className="form-group codigo-estudiante-group">
                            <label className="form-label" htmlFor="codigoEstudiante">Código de Estudiante</label>
                            <input 
                                id="codigoEstudiante"
                                type="text"
                                name="codigoEstudiante"
                                className="form-input"
                                value={formData.codigoEstudiante}
                                onChange={handleCodigoChange}
                                placeholder="12345678"
                                maxLength="8"
                                required
                            />
                            <small className="form-hint">Debe tener 8 dígitos</small>
                        </div>
                    )}
                    
                    {/* Contraseña */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="contraseña">Contraseña</label>
                        <div className="password-input-wrapper">
                            <input 
                                id="contraseña"
                                type={showPassword[0] ? "text" : "password"}
                                name="contraseña"
                                className="form-input"
                                value={formData.contraseña}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                            <button
                                type="button"
                                className={`fas ${showPassword[0] ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                                onClick={() => togglePassword(0)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        togglePassword(0);
                                    }
                                }}
                                aria-label={showPassword[0] ? "Ocultar contraseña" : "Mostrar contraseña"}
                                tabIndex={0}
                            />
                        </div>
                    </div>
                    
                    {/* Repetir Contraseña */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="repetirContraseña">Confirmar Contraseña</label>
                        <div className="password-input-wrapper">
                            <input 
                                id="repetirContraseña"
                                type={showPassword[1] ? "text" : "password"}
                                name="repetirContraseña"
                                className="form-input"
                                value={formData.repetirContraseña}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                required
                            />
                            <button
                                type="button"
                                className={`fas ${showPassword[1] ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                                onClick={() => togglePassword(1)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        togglePassword(1);
                                    }
                                }}
                                aria-label={showPassword[1] ? "Ocultar contraseña" : "Mostrar contraseña"}
                                tabIndex={0}
                            />
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="error-message" role="alert" style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>
                            {error}
                        </div>
                    )}

                    {/* Botón de Registro */}
                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>

                    <div className="login-link">
                        ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;