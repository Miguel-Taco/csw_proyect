import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/AsignacionGrupos.css";

function AsignacionGruposPage() {
    // ESTADOS DE FORMULARIO/BÚSQUEDA
    const [nombreGrupo, setNombreGrupo] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

    // ESTADOS DE DATOS
    const [alumnos, setAlumnos] = useState([]);
    const [grupos, setGrupos] = useState([]);

    // ESTADOS DE CONTROL
    const [loading, setLoading] = useState(false);
    const [cargandoGrupos, setCargandoGrupos] = useState(false);
    const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
    const [grupoEditandoId, setGrupoEditandoId] = useState(null);

    const location = useLocation();
    const navState = location.state || {};
    const [idSeccion] = useState(navState.idSeccion ?? null);

    // URLs CORREGIDAS - usando 'seccion' en lugar de 'section'
    const API_BASE_URL = "http://localhost:8080/api/grupos";
    const API_GRUPOS_SECCION_URL = "http://localhost:8080/api/grupos-seccion";

    // Cargar datos al montar
    useEffect(() => {
        if (idSeccion) {
            console.log("ID Sección:", idSeccion);
            cargarAlumnosDisponibles();
            cargarGrupos();
        } else {
            console.error("No hay ID de sección");
        }
    }, [idSeccion]);

    // Función para cargar alumnos sin grupo - URL CORREGIDA
    const cargarAlumnosDisponibles = async () => {
        try {
            setCargandoAlumnos(true);

            // Si tenemos alumnos del state, los usamos
            if (navState.alumnos && Array.isArray(navState.alumnos) && navState.alumnos.length > 0) {
                console.log("Usando alumnos del state:", navState.alumnos);
                setAlumnos(navState.alumnos);
                return;
            }

            // Endpoint CORREGIDO: seccion en lugar de section
            const url = `${API_BASE_URL}/seccion/${idSeccion}/alumnos-disponibles`;
            console.log("Cargando alumnos desde:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Alumnos cargados:", data);
            setAlumnos(data);
        } catch (error) {
            console.error("Error cargando alumnos:", error);
            alert(`Error al cargar alumnos: ${error.message}`);
        } finally {
            setCargandoAlumnos(false);
        }
    };

    // Función para cargar los grupos existentes - URL CORREGIDA
    const cargarGrupos = async () => {
        try {
            setCargandoGrupos(true);

            // Endpoint CORREGIDO: seccion en lugar de section
            const url = `${API_GRUPOS_SECCION_URL}/seccion/${idSeccion}`;
            console.log("Cargando grupos desde:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Grupos cargados:", data);
            setGrupos(data);
        } catch (error) {
            console.error("Error cargando grupos:", error);
            alert(`Error al cargar grupos: ${error.message}`);
        } finally {
            setCargandoGrupos(false);
        }
    };

    // Función para CREAR grupo
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

            const requestBody = {
                seccionId: idSeccion,
                nombreGrupo: nombreGrupo.trim(),
                alumnoIds: alumnosSeleccionados
            };

            console.log("Creando grupo:", requestBody);

            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const grupoCreado = await response.json();
            alert(`✅ Grupo "${grupoCreado.nombreGrupo}" creado exitosamente con ${grupoCreado.alumnos.length} alumnos`);

            // Limpiar y recargar
            setNombreGrupo("");
            setAlumnosSeleccionados([]);
            await cargarAlumnosDisponibles();
            await cargarGrupos();

        } catch (error) {
            console.error("Error creando grupo:", error);
            alert(`Error al crear el grupo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Función para MODIFICAR grupo
    const handleModificarGrupo = async () => {
        if (!nombreGrupo.trim()) {
            alert("Debes ingresar un nombre de grupo");
            return;
        }
        if (alumnosSeleccionados.length < 2) {
            alert("Debes seleccionar al menos 2 alumnos para el grupo");
            return;
        }

        try {
            setLoading(true);

            const requestBody = {
                seccionId: idSeccion,
                nombreGrupo: nombreGrupo.trim(),
                alumnoIds: alumnosSeleccionados
            };

            console.log("Modificando grupo:", grupoEditandoId, requestBody);

            const response = await fetch(`${API_BASE_URL}/${grupoEditandoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const grupoModificado = await response.json();
            alert(`✅ Grupo "${grupoModificado.nombreGrupo}" modificado exitosamente`);

            // Limpiar y recargar
            handleCancelarEdicion();
            await cargarAlumnosDisponibles();
            await cargarGrupos();

        } catch (error) {
            console.error("Error modificando grupo:", error);
            alert(`Error al modificar el grupo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Función unificada para guardar (crear o modificar)
    const handleGuardarGrupo = () => {
        if (grupoEditandoId) {
            handleModificarGrupo();
        } else {
            handleCrearGrupo();
        }
    };

    // Función para iniciar la edición - CORREGIDA
    const handleEditarGrupo = (grupo) => {
        console.log("Editando grupo:", grupo);
        setGrupoEditandoId(grupo.idGrupo);
        setNombreGrupo(grupo.nombreGrupo);

        // CORRECCIÓN: Verificar que grupo.alumnos existe
        const miembrosIds = (grupo.alumnos || []).map(a => a.idAlumno);
        setAlumnosSeleccionados(miembrosIds);

        setBusqueda("");
    };

    // Función para cancelar edición
    const handleCancelarEdicion = () => {
        setGrupoEditandoId(null);
        setNombreGrupo("");
        setAlumnosSeleccionados([]);
        setBusqueda("");
    };

    // FUNCIONES DE ELIMINAR ACTUALIZADAS - SIN "body stream already read"
    async function eliminarGrupo(id) {
        try {
            const res = await fetch(`http://localhost:8080/api/grupos/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' },
            });

            const contentType = res.headers.get('content-type') || '';
            const body = contentType.includes('application/json')
                ? await res.json().catch(() => ({}))
                : await res.text().catch(() => '');

            if (!res.ok) {
                const msg = typeof body === 'string'
                    ? body
                    : body?.message || body?.error || JSON.stringify(body);
                console.error('Eliminar grupo: HTTP', res.status, msg);
                alert(`No se pudo eliminar (HTTP ${res.status}). ${msg || ''}`);
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error de red eliminando grupo:', err);
            alert('Error de red al eliminar grupo.');
            return false;
        }
    }

    async function handleEliminarGrupo(grupo) {
        if (!confirm(`¿Eliminar el grupo "${grupo.nombreGrupo}"?`)) return;
        const ok = await eliminarGrupo(grupo.idGrupo || grupo.id || grupo.id_grupo);
        if (ok) {
            await cargarAlumnosDisponibles();
            await cargarGrupos();
        }
    }

    // Toggle selección de alumno
    const toggleAlumno = (idAlumno) => {
        setAlumnosSeleccionados(prev =>
            prev.includes(idAlumno)
                ? prev.filter(id => id !== idAlumno)
                : [...prev, idAlumno]
        );
    };

    // LÓGICA para mostrar alumnos - SIMPLIFICADA
    const alumnosParaMostrar = alumnos.filter(alumno => {
        // Si estamos en modo creación, mostrar solo alumnos sin grupo
        if (!grupoEditandoId) {
            return !alumno.idGrupo;
        }

        // Si estamos en modo edición, mostrar alumnos sin grupo Y los que ya están en este grupo
        const alumnosDelGrupoEditando = grupos.find(g => g.idGrupo === grupoEditandoId)?.alumnos || [];
        const esMiembro = alumnosDelGrupoEditando.some(a => a.idAlumno === alumno.idAlumno);

        return !alumno.idGrupo || esMiembro;
    });

    // Filtrar por búsqueda
    const alumnosFiltrados = alumnosParaMostrar.filter(alumno =>
        alumno.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        alumno.codigoAlumno?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="asignacionPage-body">
            <div className="asignacion-overlay">
                <div className="asignacion-modal">
                    <div className="main-asignacionPage-container">

                        {/* DEBUG INFO - Temporal para verificar datos */}
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                            ID Sección: {idSeccion} | Alumnos: {alumnos.length} | Grupos: {grupos.length}
                        </div>

                        {/* SECCIÓN CREAR/EDITAR GRUPO */}
                        <div className="asignacion-header">
                            <input
                                type="text"
                                placeholder={grupoEditandoId ? "Nombre del grupo a editar" : "Nombre de grupo"}
                                className="input-nombre-grupo"
                                value={nombreGrupo}
                                onChange={(e) => setNombreGrupo(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                className="button-asignacionPage"
                                onClick={handleGuardarGrupo}
                                disabled={!nombreGrupo.trim() || alumnosSeleccionados.length < 2 || loading}
                            >
                                {loading
                                    ? "GUARDANDO..."
                                    : grupoEditandoId ? "GUARDAR CAMBIOS" : "CREAR GRUPO"}
                            </button>
                            {grupoEditandoId && (
                                <button
                                    className="button-asignacionPage cancelar"
                                    onClick={handleCancelarEdicion}
                                    disabled={loading}
                                    style={{ marginLeft: '10px', backgroundColor: '#dc3545' }}
                                >
                                    CANCELAR
                                </button>
                            )}
                        </div>

                        <div className="input-buscador-container solo">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar alumno (código o nombre)"
                                className="input-buscador"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* LISTA DE ALUMNOS */}
                        <div className="asignacion-lista-container simple">
                            {cargandoAlumnos ? (
                                <p className="no-resultados">Cargando alumnos...</p>
                            ) : alumnosFiltrados.length > 0 ? (
                                alumnosFiltrados.map((alumno) => {
                                    const seleccionado = alumnosSeleccionados.includes(alumno.idAlumno);
                                    const alumnosDelGrupoEditando = grupos.find(g => g.idGrupo === grupoEditandoId)?.alumnos || [];
                                    const esMiembroActual = grupoEditandoId &&
                                        alumnosDelGrupoEditando.some(a => a.idAlumno === alumno.idAlumno);

                                    const label = esMiembroActual ? "(Miembro Actual)" : "";

                                    return (
                                        <div
                                            key={alumno.idAlumno}
                                            className={`alumno-item ${seleccionado ? "seleccionado" : ""}`}
                                            onClick={() => toggleAlumno(alumno.idAlumno)}
                                        >
                                            <span className="alumno-nombre">
                                                {alumno.nombreCompleto}
                                                <span
                                                    style={{
                                                        marginLeft: "8px",
                                                        fontSize: "11px",
                                                        color: seleccionado ? "#fff" : "#666",
                                                        fontWeight: "400"
                                                    }}
                                                >
                                                    ({alumno.codigoAlumno}) {label}
                                                </span>
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={seleccionado}
                                                onChange={() => toggleAlumno(alumno.idAlumno)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={loading}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-resultados">
                                    {alumnos.length === 0
                                        ? "No hay alumnos disponibles para agrupar"
                                        : "No se encontraron alumnos con ese criterio"}
                                </p>
                            )}
                        </div>

                        <hr style={{ margin: '20px 0' }}/>

                        {/* SECCIÓN DE GRUPOS CREADOS */}
                        <h3>Grupos Existentes ({grupos.length})</h3>
                        <div className="asignacion-lista-container grupos">
                            {cargandoGrupos ? (
                                <p className="no-resultados">Cargando grupos existentes...</p>
                            ) : grupos.length > 0 ? (
                                grupos.map((grupo) => (
                                    <div
                                        key={grupo.idGrupo}
                                        className={`grupo-item ${grupo.idGrupo === grupoEditandoId ? "editando" : ""}`}
                                        style={{ backgroundColor: grupo.idGrupo === grupoEditandoId ? '#e6f7ff' : '#f9f9f9' }}
                                    >
                                        <div className="grupo-info">
                                            <span className="grupo-nombre-texto">
                                                {grupo.nombreGrupo}
                                            </span>
                                            <span className="grupo-miembros">
                                                ({(grupo.alumnos || []).length} miembros)
                                            </span>
                                            {grupo.promedioFinal && (
                                                <span className="grupo-promedio">
                                                    Promedio: {grupo.promedioFinal}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grupo-acciones">
                                            <button
                                                className="button-accion-grupo editar"
                                                onClick={() => handleEditarGrupo(grupo)}
                                                disabled={loading || (grupoEditandoId !== null && grupoEditandoId !== grupo.idGrupo)}
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-eliminar"
                                                onClick={() => handleEliminarGrupo(grupo)}
                                                disabled={loading || grupoEditandoId !== null}
                                                style={{ marginLeft: '8px' }}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-resultados">Aún no hay grupos creados para esta sección.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AsignacionGruposPage;