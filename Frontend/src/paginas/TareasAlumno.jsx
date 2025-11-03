// TareasAlumno.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from "../componentes/Modal";
import { useAuth } from "../context/AuthContext";
import "../styles/TareasAlumno.css";

function TareasAlumno() {
    const { user } = useAuth();
    const { idSeccion } = useParams();
    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(false);
    const [companeros, setCompaneros] = useState([]);
    const [loadingCompaneros, setLoadingCompaneros] = useState(false);
    const [errorCompaneros, setErrorCompaneros] = useState("");
    
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        cargarTareas();
    }, [idSeccion]);

    // Función para formatear fechas
    const formatearFechaCorta = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        
        const fecha = new Date(fechaISO);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    };

    const cargarTareas = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(
                `${BASE_URL}/api/tareas/seccion/${idSeccion}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = await response.json();
            
            if (data.success) {
                setTareas(data.tareas);
            } else {
                setError(data.message || "Error al cargar tareas");
            }
        } catch (err) {
            console.error("Error al cargar tareas:", err);
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const obtenerCompaneros = async () => {
        setLoadingCompaneros(true);
        setErrorCompaneros("");
        try {
            const response = await fetch(`${BASE_URL}/api/grupos/companeros`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_seccion: Number.parseInt(idSeccion),
                    id_persona: user.id
                }),
            });

            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }

            const data = await response.json();
            setCompaneros(data);
        } catch (err) {
            console.error("Error al obtener compañeros:", err);
            setErrorCompaneros("No se pudieron cargar los compañeros del grupo");
        } finally {
            setLoadingCompaneros(false);
        }
    };


    // Determinar qué contenido mostrar
    let tareasContent;
    
    if (loading) {
        tareasContent = <p>Cargando tareas...</p>;
    } else if (tareas.length === 0) {
        tareasContent = <p>No hay tareas disponibles para esta sección.</p>;
    } else {
        tareasContent = (
            <div className="tareas-lista">
                {tareas.map((tarea) => (
                    <div key={tarea.idTarea} className="tarea-card">
                        <div className='tarea-entrega'>
                            <h3>{tarea.nombre}</h3>
                            <button className="btn-primary" onClick={() => console.log(tarea.idTarea)}>Subir Entrega</button>
                        </div>
                        <p>Descripción: {tarea.descripcion}</p>
                        <p>Tipo de Tarea: {tarea.tipo}</p>
                        <div className='tareas-fechas'>
                            <p>Fecha Creación: {formatearFechaCorta(tarea.fechaCreacion)}</p>
                            <p>Fecha Vencimiento: {formatearFechaCorta(tarea.fechaVencimiento)}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const modalContent = (
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="Mi Grupo de Trabajo"
        >
            {(() => {
                if (loadingCompaneros) {
                    return <p>Cargando compañeros...</p>;
                }
                if (errorCompaneros) {
                    return <p style={{ color: "red" }}>{errorCompaneros}</p>;
                }
                if (companeros.length === 0) {
                    return <p>No se encontraron compañeros en tu grupo.</p>;
                }
                return (
                    <div className="companeros-lista">
                        {companeros.map((c, index) => (
                            <li key={c.id_persona ?? index} className="companero-card">
                                <p>{c.nombres} {c.apellido_p} {c.apellido_m}</p>
                            </li>
                        ))}
                    </div>
                );
            })()}
        </Modal>
    );

    return (
        <div className="tareas-page">
            <div className='main-container'>
                <div className='encabezado'>
                    <button className="btn-primary" onClick={() => navigate("/alumnosPage")}>
                        ← Volver
                    </button>
                    <h1>Tareas de la Sección</h1>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setOpenModal(true);
                            obtenerCompaneros();
                        }}
                    >
                        Ver Grupo de Trabajo
                    </button>
                </div>

                {error && (
                    <div style={{ color: 'red', padding: '10px' }}>
                        {error}
                    </div>
                )}

                {tareasContent}
                {modalContent}

            </div>
        </div>
    );
}

export default TareasAlumno;