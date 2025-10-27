import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SeccionesPage.css"
import SeccionAlumnoCard from "../componentes/SeccionAlumnoCard";
import InvitacionesPendientesButton from "../componentes/InvitacionesPendientesButton";

function AlumnoPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [secciones, setSecciones] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(2026);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [idAlumno, setIdAlumno] = useState(null);
    
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        if (user?.id) {
            obtenerIdAlumno();
        }
    }, [user]);

    useEffect(() => {
        if (idAlumno) {
            cargarSecciones();
        }
    }, [idAlumno, anioSeleccionado]);
    
    const obtenerIdAlumno = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/alumno/alumno-id/${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setIdAlumno(data.idAlumno);
            } else {
                setError("Usuario no es un alumno");
            }
        } catch (err) {
            console.error("Error al obtener id_alumno:", err);
            setError("Error al verificar usuario");
        }
    };

    const cargarSecciones = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(
                `${BASE_URL}/api/alumno/secciones/${idAlumno}/anio/${anioSeleccionado}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSecciones(data);
            } else {
                setError("Error al cargar las secciones");
            }
        } catch (err) {
            console.error("Error al cargar secciones:", err);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmar = window.confirm("¿Está seguro que desea cerrar sesión?");
        if (confirmar) {
            await logout();
            navigate("/login");
        }
    };

    return(
        <div className="seccionesPage-body">
            <div className="main-seccionesPage-container row">
                <div className="perfil-container col">
                    <h2>SALUDOS, {user?.nombres?.toUpperCase() || 'USUARIO'}</h2>
                    <i className="fa-solid fa-user"></i>
                </div>
                <div className="secciones-crud-container col">
                    <div className="secciones-header-container row">
                        <select 
                            value={anioSeleccionado} 
                            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                            disabled={loading}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                        
                        {/* Botón de invitaciones pendientes */}
                        <InvitacionesPendientesButton />

                        <button 
                            onClick={handleLogout} 
                            className="logout-button" 
                            title="Cerrar sesión"
                            disabled={loading}
                        > 
                            Cerrar Sesión
                        </button>
                    </div>

                    {error && (
                        <div style={{color: 'red', padding: '10px', textAlign: 'center'}}>
                            {error}
                        </div>
                    )}

                    <div className="secciones-container row">
                        {loading && secciones.length === 0 ? (
                            <p>Cargando secciones...</p>
                        ) : secciones.length === 0 ? (
                            <p>No estás inscrito en ninguna sección para este año. Revisa tus invitaciones pendientes.</p>
                        ) : (
                            secciones.map((sec) => (
                                <SeccionAlumnoCard 
                                    key={sec.idSeccion} 
                                    seccion={sec}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlumnoPage;