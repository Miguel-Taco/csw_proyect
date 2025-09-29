import { useState } from "react";
import "../styles/AsignacionGrupos.css";

function AsignacionGruposPage() {
    // Estado del nombre del grupo
    const [nombreGrupo, setNombreGrupo] = useState("");

    // Estado de búsqueda
    const [busqueda, setBusqueda] = useState("");

    // Estado de alumnos seleccionados (selección múltiple)
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

    // Array de alumnos (esto luego lo podrás traer de tu backend)
    const alumnos = [
        "Leon Gerardo",
        "Javier Paredes",
        "Valeria Ortega",
        "Mateo Salazar",
        "Andrés Villanueva",
        "Ignacio Herrera",
        "Sofía Méndez",
        "Martina Lozano"
    ];

    // Filtrado de alumnos según búsqueda
    const alumnosFiltrados = alumnos.filter(a =>
        a.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Función al crear grupo
    const handleCrearGrupo = () => {
        if (!nombreGrupo) {
            alert("Debes ingresar un nombre de grupo");
            return;
        }
        if (alumnosSeleccionados.length === 0) {
            alert("Debes seleccionar al menos un alumno");
            return;
        }
        alert(`✅ Grupo "${nombreGrupo}" creado con: ${alumnosSeleccionados.join(", ")}`);
        setNombreGrupo("");
        setAlumnosSeleccionados([]);
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
                    />
                    <button
                        className="button-asignacionPage"
                        onClick={handleCrearGrupo}
                    >
                        CREAR
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
                    />
                </div>
                <div className="asignacion-lista-container simple">
                    {alumnosFiltrados.length > 0 ? (
                        alumnosFiltrados.map((alumno, index) => {
                            const seleccionado = alumnosSeleccionados.includes(alumno);
                            const toggleAlumno = () => {
                                setAlumnosSeleccionados(prev =>
                                    prev.includes(alumno)
                                        ? prev.filter(a => a !== alumno)
                                        : [...prev, alumno]
                                );
                            };
                            return (
                                <div
                                    key={index}
                                    className={`alumno-item ${seleccionado ? "seleccionado" : ""}`}
                                    onClick={toggleAlumno}
                                >
                                    <span className="alumno-nombre">{alumno}</span>
                                    <input
                                        type="checkbox"
                                        checked={seleccionado}
                                        onChange={toggleAlumno}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-resultados">No se encontraron alumnos</p>
                    )}
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AsignacionGruposPage;