import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/SeccionesPage.css"
import SeccionCard from "../componentes/SeccionCard";
import CrearSeccionModal from "../componentes/CrearSeccionModal";
import EditarSeccionModal from "../componentes/EditarSeccionModal";

function SeccionesPage(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [secciones, setSecciones] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(2025);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [idProfesor, setIdProfesor] = useState(null);
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [seccionAEditar, setSeccionAEditar] = useState(null);
    
    const BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        if (user?.id) {
            obtenerIdProfesor();
        }
    }, [user]);

    useEffect(() => {
        if (idProfesor) {
            cargarSecciones();
        }
    }, [idProfesor, anioSeleccionado]);

    const obtenerIdProfesor = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/secciones/profesor-id/${user.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setIdProfesor(data.idProfesor);
            } else {
                setError("Usuario no es profesor");
            }
        } catch (err) {
            console.error("Error al obtener id_profesor:", err);
            setError("Error al verificar usuario");
        }
    };

    const cargarSecciones = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(
                `${BASE_URL}/api/secciones/profesor/${idProfesor}/anio/${anioSeleccionado}`,
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

    const handleAgregarSeccion = () => {
        setModalCrearOpen(true);
    };

    const handleAsignarGrupos = async (seccion) => {
        // Cargar alumnos de la sección y navegar pasando la lista en navigation state
        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/api/secciones/${seccion.idSeccion}/alumnos`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al obtener alumnos');
            }

            const alumnos = await response.json();
            // Navegar a la pantalla de asignación pasando idSeccion y la lista de alumnos
            navigate('/asignacion-grupos', { state: { idSeccion: seccion.idSeccion, alumnos } });
        } catch (err) {
            console.error('Error al cargar alumnos de la sección:', err);
            alert('No se pudo cargar la lista de alumnos de la sección');
        } finally {
            setLoading(false);
        }
    };

    const handleCrearSeccion = async (nombreSeccion) => {
        setLoading(true);
        setModalCrearOpen(false);
        
        try {
            const payload = {
                id_profesor: idProfesor,
                nombreCurso: nombreSeccion,
                anio: anioSeleccionado,
                codigo: Math.floor(Math.random() * 10000)
            };
            
            const response = await fetch(`${BASE_URL}/api/secciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                await cargarSecciones();
            } else {
                alert(data.message || "Error al crear la sección");
            }
        } catch (err) {
            console.error("Error al crear sección:", err);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirEditar = (seccion) => {
        setSeccionAEditar(seccion);
        setModalEditarOpen(true);
    };

    const handleIrATareas = (idSeccion) => {
        navigate(`/secciones/${idSeccion}/tareas`);
    };


    const handleEditarSeccion = async (idSeccion, nombreCurso, anio) => {
        console.log("🔵 Editando sección");
        console.log("   ID Sección:", idSeccion);
        console.log("   Nombre:", nombreCurso);
        console.log("   Año:", anio);
        console.log("   ID Profesor:", idProfesor);
        
        setLoading(true);
        setModalEditarOpen(false);
        
        try {
            // ✅ Payload correcto - solo nombreCurso y anio
            const payload = {
                nombreCurso: nombreCurso,
                anio: anio
            };
            
            console.log("🟢 Payload a enviar:", JSON.stringify(payload, null, 2));
            
            const response = await fetch(
                `${BASE_URL}/api/secciones/${idSeccion}/profesor/${idProfesor}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();
            console.log("🟢 Respuesta del servidor:", data);

            if (data.success) {
                await cargarSecciones();
                alert("Sección actualizada exitosamente");
            } else {
                alert(data.message || "Error al editar la sección");
            }
        } catch (err) {
            console.error("💥 Error al editar sección:", err);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
            setSeccionAEditar(null);
        }
    };

    const handleEliminarSeccion = async (idSeccion) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}/api/secciones/${idSeccion}/profesor/${idProfesor}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = await response.json();

            if (data.success) {
                await cargarSecciones();
            } else {
                alert(data.message || "Error al eliminar la sección");
            }
        } catch (err) {
            console.error("Error al eliminar sección:", err);
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmar = globalThis.confirm("¿Está seguro que desea cerrar sesión?");
        if (confirmar) {
            await logout();
            navigate("/login");
        }
    };

    let contenidoSecciones;

    if (loading && secciones.length === 0) {
        // Estado: Cargando por primera vez
        contenidoSecciones = <p>Cargando secciones...</p>;
    } else if (secciones.length === 0) {
        // Estado: Carga completa, pero no hay datos
        contenidoSecciones = <p>No hay secciones para este año</p>;
    } else {
        // Estado: Carga completa, y hay secciones para mostrar
        contenidoSecciones = secciones.map((sec) => (
            <SeccionCard 
                key={sec.idSeccion} 
                seccion={sec}
                onEliminar={handleEliminarSeccion}
                onEditar={handleAbrirEditar}
                onIrATareas={handleIrATareas}
            />
        ));
    }

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
                        <button 
                            onClick={handleLogout} 
                            className="logout-button" 
                            title="Cerrar sesión"
                            disabled={loading}
                        > 
                            Cerrar Sesión
                        </button>
                        {/* botón global de asignación removido: ahora cada sección muestra su propio botón 'Asignar grupos' */}
                        <button 
                            className="button-seccionesPage" 
                            onClick={handleAgregarSeccion}
                            disabled={loading || !idProfesor}
                        >
                            {loading ? "Cargando..." : "Agregar nueva sección"}
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
                            <p>No hay secciones para este año</p>
                        ) : (
                            secciones.map((sec) => (
                                <SeccionCard 
                                    key={sec.idSeccion} 
                                    seccion={sec}
                                    onEliminar={handleEliminarSeccion}
                                    onEditar={handleAbrirEditar}
                                    onIrATareas={handleIrATareas}
                                    onAsignarGrupos={handleAsignarGrupos}
                                />
                            ))
                        )}
                        {contenidoSecciones}
                    </div>
                </div>
            </div>

            <CrearSeccionModal
                open={modalCrearOpen}
                onClose={() => setModalCrearOpen(false)}
                onCrear={handleCrearSeccion}
                anioActual={anioSeleccionado}
            />

            <EditarSeccionModal
                open={modalEditarOpen}
                onClose={() => {
                    setModalEditarOpen(false);
                    setSeccionAEditar(null);
                }}
                onEditar={handleEditarSeccion}
                seccion={seccionAEditar}
                anioActual={anioSeleccionado}
            />
        </div>
    );
}

export default SeccionesPage;