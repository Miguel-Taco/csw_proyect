import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Register.css"
import "../styles/Login.css"

function Register() {
    const [showPassword, setShowPassword] = useState([false, false]);
    const [formData, setFormData] = useState({nombres: "", apellidoP: "", apellidoM: "", correo: "", contraseña: "", repetirContraseña: ""});
    const inputs = [ { label: "Nombres", name: "nombres" }, { label: "Apellido Paterno", name: "apellidoP" }, { label: "Apellido Materno", name: "apellidoM" }, { label: "Correo", name: "correo" } ];
    const passwordInputs = [ { label: "Contraseña", name: "contraseña" }, { label: "Repita la contraseña", name: "repetirContraseña" } ];
    
    const togglePassword = (index) => {
        const newState = [...showPassword];
        newState[index] = !newState[index];
        setShowPassword(newState);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const pruebaInputs = () => {
        console.log("Datos de los inputs:", formData);
    };
    
    return(
        <div className="register-body">
            <div className="register-main-container">
                <div className="main-container-label">
                    <h2> Registro </h2>
                </div>
                
                <div className="register-input-container">
                    {inputs.map((input, index) => (
                    <div className="register-input-container-area" key={index}>
                        <h3>{input.label}</h3>
                        <input name={input.name} value={formData[input.name]} onChange={handleChange} />
                    </div>
                    ))}

                    {passwordInputs.map((input, index) => (
                        <div className="register-input-container-area" key={index}>
                            <h3>{input.label}</h3>
                            <div className="register-input-password">
                                <input name={input.name} type={showPassword[index] ? "text" : "password"} value={formData[input.name]} onChange={handleChange} />
                                <i
                                className={`fas ${showPassword[index] ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => togglePassword(index)}
                                style={{ cursor: "pointer" }}
                                title={showPassword[index] ? "Ocultar contraseña" : "Mostrar contraseña"}
                                ></i>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="login-button register-button" onClick={pruebaInputs}>Registrarse</button>
                <Link to="/login" className="login-registrar ir-login-button">Ir a Inicio de Sesion</Link>
            </div>

        </div>
    );
}

export default Register;