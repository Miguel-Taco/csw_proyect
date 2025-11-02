// TareasAlumno.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import SubirTareas from "./SubirTareas";
import "../styles/TareasAlumno.css";

function TareasAlumno() {
    const { idSeccion } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [miGrupo, setMiGrupo] = useState(null);
    const [mostrarSubir, setMostrarSubir] = useState(false);

    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        cargarTareas();
        cargarMiGrupo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const cargarMiGrupo = async () => {
        try {
            // Opción 1: Endpoint específico para obtener el grupo del alumno
            const res = await fetch(`${BASE_URL}/api/grupos/seccion/${idSeccion}/mi-grupo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Si necesitas enviar el ID del alumno en el header o parámetro
                    'User-ID': user?.id
                },
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setMiGrupo(data || null);
            } else {
                // Si el endpoint específico falla, intentar con el endpoint general
                await cargarMiGrupoAlternativo();
            }
        } catch (error) {
            console.error("Error al cargar grupo:", error);
            await cargarMiGrupoAlternativo();
        }
    };

    const cargarMiGrupoAlternativo = async () => {
        try {
            // Opción 2: Cargar todos los grupos y buscar el del alumno
            const res = await fetch(`${BASE_URL}/api/grupos/seccion/${idSeccion}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const grupos = await res.json();
                // Buscar el grupo que contiene al alumno actual
                const grupoDelAlumno = grupos.find(grupo =>
                    grupo.alumnos && grupo.alumnos.some(alumno => alumno.idAlumno === user?.id)
                );
                setMiGrupo(grupoDelAlumno || null);
            } else {
                setMiGrupo(null);
            }
        } catch {
            setMiGrupo(null);
        }
    };

    const handleVerGrupoTrabajo = () => {
        if (miGrupo) {
            setMostrarSubir(true);
        } else {
            alert("Aún no tienes grupo asignado en esta sección");
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
                        onClick={handleVerGrupoTrabajo}
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

                {/* Modal para subir tareas grupales */}
                {mostrarSubir && miGrupo && (
                    <SubirTareas
                        grupo={miGrupo}
                        onClose={() => setMostrarSubir(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default TareasAlumno;