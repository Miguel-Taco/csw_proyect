import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/AsignacionGrupos.css";

function AsignacionGruposPage() {
    // Estado del nombre del grupo
    const [nombreGrupo, setNombreGrupo] = useState("");

    // Estado de búsqueda
    const [busqueda, setBusqueda] = useState("");

    // Estado de alumnos seleccionados (selección múltiple)
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

    // Estado de alumnos disponibles (sin grupo)
    const [alumnos, setAlumnos] = useState([]);

    // Estado de carga
    const [loading, setLoading] = useState(false);

    // Obtener id de sección y alumnos desde navigation state si vienen
    const location = useLocation();
    const navState = location.state || {};
    const [idSeccion, setIdSeccion] = useState(navState.idSeccion ?? null);

    // URL base de tu API
    const API_BASE_URL = "http://localhost:8080/api/grupos";

    // Cargar alumnos disponibles al montar o cuando cambie la sección
    useEffect(() => {
        if (idSeccion) cargarAlumnosDisponibles();
    }, [idSeccion]);

    // Función para cargar alumnos sin grupo
    const cargarAlumnosDisponibles = async () => {
        try {
            setLoading(true);
            // Si la navegación nos pasó la lista de alumnos, úsalos directamente
            if (navState.alumnos && Array.isArray(navState.alumnos) && navState.alumnos.length > 0) {
                setAlumnos(navState.alumnos);
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/seccion/${idSeccion}/alumnos-disponibles`
            );

            if (!response.ok) {
                throw new Error("Error al cargar alumnos");
            }

            const data = await response.json();
            setAlumnos(data);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar la lista de alumnos");
        } finally {
            setLoading(false);
        }
    };

    // Filtrado de alumnos según búsqueda
    const alumnosFiltrados = alumnos.filter(a =>
        a.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.codigoAlumno.toLowerCase().includes(busqueda.toLowerCase())
    );

    const botonDisponible = Boolean(idSeccion) && alumnos.length > 0 && !loading;

    // Función al crear grupo
    const handleCrearGrupo = async () => {
        if (!nombreGrupo.trim()) {
            alert("Debes ingresar un nombre de grupo");
            return;
        }
        if (alumnosSeleccionados.length < 2) {
            alert("Debes seleccionar al menos 2 alumnos para crear un grupo");
            return;
        }

        try {
            setLoading(true);

            const request = {
                seccionId: idSeccion,
                nombreGrupo: nombreGrupo.trim(),
                alumnoIds: alumnosSeleccionados
            };

            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al crear el grupo");
            }

            const grupoCreado = await response.json();

            alert(
                `✅ Grupo "${grupoCreado.nombreGrupo}" creado exitosamente con ${grupoCreado.alumnos.length} alumnos`
            );

            // Limpiar formulario
            setNombreGrupo("");
            setAlumnosSeleccionados([]);

            // Recargar lista de alumnos disponibles
            await cargarAlumnosDisponibles();
        } catch (error) {
            console.error("Error:", error);
            alert(`Error al crear el grupo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Toggle selección de alumno
    const toggleAlumno = (idAlumno) => {
        setAlumnosSeleccionados(prev =>
            prev.includes(idAlumno)
                ? prev.filter(id => id !== idAlumno)
                : [...prev, idAlumno]
        );
    };

    return (
        <div className="asignacionPage-body">
            <div className="asignacion-overlay">
                <div className="asignacion-modal">
                    <div className="main-asignacionPage-container minimal">
                        <div className="asignacion-header">
                            <input
                                type="text"
                                placeholder="nombre de grupo"
                                className="input-nombre-grupo"
                                value={nombreGrupo}
                                onChange={(e) => setNombreGrupo(e.target.value)}
                                disabled={!botonDisponible}
                            />
                            <button
                                className="button-asignacionPage"
                                onClick={handleCrearGrupo}
                                disabled={!botonDisponible}
                            >
                                {loading ? "CREANDO..." : "CREAR"}
                            </button>
                        </div>
                        <div className="input-buscador-container solo">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="alumno"
                                className="input-buscador"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="asignacion-lista-container simple">
                            {loading ? (
                                <p className="no-resultados">Cargando alumnos...</p>
                            ) : alumnosFiltrados.length > 0 ? (
                                alumnosFiltrados.map((alumno) => {
                                    const seleccionado = alumnosSeleccionados.includes(
                                        alumno.idAlumno
                                    );
                                    return (
                                        <div
                                            key={alumno.idAlumno}
                                            className={`alumno-item ${
                                                seleccionado ? "seleccionado" : ""
                                            }`}
                                            onClick={() => toggleAlumno(alumno.idAlumno)}
                                        >
                                            <span className="alumno-nombre">
                                                {alumno.nombreCompleto}
                                                <span
                                                    style={{
                                                        marginLeft: "8px",
                                                        fontSize: "11px",
                                                        color: "#666",
                                                        fontWeight: "400"
                                                    }}
                                                >
                                                    ({alumno.codigoAlumno})
                                                </span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={seleccionado}
                                                onChange={() => toggleAlumno(alumno.idAlumno)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-resultados">
                                    {alumnos.length === 0
                                        ? "No hay alumnos disponibles para agrupar"
                                        : "No se encontraron alumnos"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AsignacionGruposPage;