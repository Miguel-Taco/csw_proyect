<<<<<<< Updated upstream
import React from "react";
import GestionGrupos from "../componentes/GestionGrupos";

export default function GestionGruposPage() {
    return <GestionGrupos />;
=======
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SubirTareas from "../paginas/SubirTareas"; // usamos TU modal ya existente
import "../styles/AsignacionGrupos.css"; // o crea un css ligero si prefieres

export default function GestionGruposPage() {
    const { idSeccion } = useParams();
    const [grupos, setGrupos] = useState([]);
    const [grupoParaTareas, setGrupoParaTareas] = useState(null);
    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        if (idSeccion) cargarGrupos();
    }, [idSeccion]);

    const cargarGrupos = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/grupos/seccion/${idSeccion}`);
            if (!res.ok) throw new Error("Error al obtener grupos");
            const data = await res.json();
            setGrupos(data);
        } catch (e) {
            console.error(e);
            alert("No se pudieron cargar los grupos");
        }
    };

    const eliminarGrupo = async (idGrupo) => {
        if (!confirm("¿Eliminar este grupo y sus tareas?")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/grupos/${idGrupo}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar grupo");
            await cargarGrupos();
        } catch (e) {
            console.error(e);
            alert("Error al eliminar grupo");
        }
    };

    const renombrarGrupo = async (idGrupo, nuevoNombre) => {
        const nombre = (nuevoNombre || "").trim();
        if (!nombre) return;
        try {
            const res = await fetch(`${BASE_URL}/api/grupos/${idGrupo}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombreGrupo: nombre }),
            });
            if (!res.ok) throw new Error("Error al renombrar grupo");
            await cargarGrupos();
        } catch (e) {
            console.error(e);
            alert("Error al renombrar grupo");
        }
    };

    return (
        <div className="asignacionPage-body">
            <div className="asignacion-overlay">
                <div className="asignacion-modal">
                    <div className="main-asignacionPage-container minimal">
                        <div className="asignacion-header" style={{ justifyContent: "space-between" }}>
                            <h2 style={{ margin: 0 }}>Grupos – Sección {idSeccion}</h2>
                            <Link to={`/secciones/${idSeccion}/tareas`} className="button-asignacionPage">
                                ← Volver a Tareas
                            </Link>
                        </div>

                        {grupos.length === 0 ? (
                            <p className="no-resultados">No hay grupos en esta sección</p>
                        ) : (
                            <div className="asignacion-lista-container simple">
                                {grupos.map((g) => (
                                    <div key={g.idGrupo} className="alumno-item" style={{ alignItems: "flex-start" }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                defaultValue={g.nombreGrupo}
                                                onBlur={(e) => renombrarGrupo(g.idGrupo, e.target.value)}
                                                style={{ width: "100%", marginBottom: 6, padding: 6 }}
                                            />
                                            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
                                                Integrantes:
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                {g.alumnos?.length ? (
                                                    g.alumnos.map((a) => (
                                                        <li key={a.idAlumno}>
                                                            {a.nombreCompleto} {a.codigoAlumno ? `(${a.codigoAlumno})` : ""}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li style={{ opacity: 0.7 }}>Sin integrantes</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                className="button-asignacionPage"
                                                onClick={() => setGrupoParaTareas(g)}
                                            >
                                                📂 Tareas
                                            </button>
                                            <button className="button-asignacionPage" onClick={() => eliminarGrupo(g.idGrupo)}>
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para ver/subir tareas de ese grupo */}
            {grupoParaTareas && (
                <SubirTareas grupo={grupoParaTareas} onClose={() => setGrupoParaTareas(null)} />
            )}
        </div>
    );
>>>>>>> Stashed changes
}
