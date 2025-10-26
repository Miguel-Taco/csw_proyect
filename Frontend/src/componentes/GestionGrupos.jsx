import React, { useEffect, useMemo, useState } from "react";

/** Util: ID simple */
const uid = () => Math.random().toString(36).slice(2, 9);

/** Persistencia en localStorage */
const STORAGE_KEY = "scorely_grupos_v1";
const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};
const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

export default function GestionGrupos() {
    const persisted = loadState();

    const [alumnosPool, setAlumnosPool] = useState(persisted?.alumnosPool ?? []);
    const [grupos, setGrupos] = useState(persisted?.grupos ?? []);
    const [nuevoGrupo, setNuevoGrupo] = useState("");
    const [nuevoAlumno, setNuevoAlumno] = useState("");

    /** Guardar cada cambio */
    useEffect(() => {
        saveState({ alumnosPool, grupos });
    }, [alumnosPool, grupos]);

    /** === Crear grupo === */
    const crearGrupo = () => {
        const nombre = nuevoGrupo.trim();
        if (!nombre) return alert("Escribe un nombre de grupo");
        setGrupos((prev) => [...prev, { id: uid(), nombre, miembros: [] }]);
        setNuevoGrupo("");
    };

    /** === Eliminar grupo === */
    const eliminarGrupo = (id) => {
        if (!confirm("¿Eliminar este grupo?")) return;
        // devolver sus miembros al pool
        const grupo = grupos.find((g) => g.id === id);
        if (grupo?.miembros?.length) {
            setAlumnosPool((p) => [...p, ...grupo.miembros]);
        }
        setGrupos((prev) => prev.filter((g) => g.id !== id));
    };

    /** === Agregar alumno al pool === */
    const agregarAlumno = () => {
        const nombre = nuevoAlumno.trim();
        if (!nombre) return alert("Escribe el nombre del alumno");
        setAlumnosPool((p) => [...p, { id: uid(), nombre }]);
        setNuevoAlumno("");
    };

    /** === Quitar alumno del pool === */
    const quitarAlumnoPool = (id) => {
        setAlumnosPool((p) => p.filter((a) => a.id !== id));
    };

    /** === Asignar alumno desde pool a grupo === */
    const asignarAlumno = (alumnoId, grupoId) => {
        const alumno = alumnosPool.find((a) => a.id === alumnoId);
        if (!alumno) return;

        setGrupos((prev) =>
            prev.map((g) => (g.id === grupoId ? { ...g, miembros: [...g.miembros, alumno] } : g))
        );
        setAlumnosPool((p) => p.filter((a) => a.id !== alumnoId));
    };

    /** === Quitar alumno de un grupo (regresa al pool) === */
    const quitarDeGrupo = (grupoId, alumnoId) => {
        const grupo = grupos.find((g) => g.id === grupoId);
        const alumno = grupo?.miembros.find((m) => m.id === alumnoId);
        if (!alumno) return;

        setGrupos((prev) =>
            prev.map((g) =>
                g.id === grupoId ? { ...g, miembros: g.miembros.filter((m) => m.id !== alumnoId) } : g
            )
        );
        setAlumnosPool((p) => [...p, alumno]);
    };

    /** === Auto-distribuir alumnos del pool en grupos (equilibrado) === */
    const autoDistribuir = () => {
        if (!grupos.length) return alert("Crea al menos un grupo");
        if (!alumnosPool.length) return alert("No hay alumnos en el pool");

        // Copias mutables
        const pool = [...alumnosPool];
        const next = grupos.map((g) => ({ ...g, miembros: [...g.miembros] }));

        // Ordenar grupos por tamaño (se irá actualizando en cada vuelta)
        while (pool.length) {
            next.sort((a, b) => a.miembros.length - b.miembros.length);
            const alumno = pool.shift();
            next[0].miembros.push(alumno);
        }

        setGrupos(next);
        setAlumnosPool([]);
    };

    /** === Limpiar todo === */
    const resetear = () => {
        if (!confirm("Esto borrará grupos y alumnos guardados. ¿Continuar?")) return;
        setGrupos([]);
        setAlumnosPool([]);
    };

    /** Para selects */
    const alumnosOptions = useMemo(
        () => alumnosPool.map((a) => ({ value: a.id, label: a.nombre })),
        [alumnosPool]
    );

    return (
        <div style={{ maxWidth: 1100, margin: "24px auto", padding: "16px" }}>
            <h1 style={{ marginBottom: 8 }}>Gestión de grupos</h1>
            <p style={{ marginTop: 0, opacity: 0.8 }}>
                Crea grupos, agrega alumnos y asígnalos manualmente o automáticamente.
            </p>

            {/* Barra de acciones rápidas */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <button onClick={autoDistribuir}>Auto-distribuir</button>
                <button onClick={resetear} style={{ background: "#fee2e2" }}>
                    Resetear todo
                </button>
            </div>

            {/* Paneles: Pool de alumnos y Creación de grupo */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* Pool de alumnos */}
                <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12 }}>
                    <h2 style={{ marginTop: 0 }}>Alumnos (pool)</h2>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input
                            style={{ flex: 1, padding: 8 }}
                            type="text"
                            placeholder="Nombre del alumno"
                            value={nuevoAlumno}
                            onChange={(e) => setNuevoAlumno(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && agregarAlumno()}
                        />
                        <button onClick={agregarAlumno}>Añadir</button>
                    </div>

                    {alumnosPool.length === 0 ? (
                        <div style={{ opacity: 0.7 }}>Sin alumnos por asignar.</div>
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {alumnosPool.map((a) => (
                                <li key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                    <span>{a.nombre}</span>
                                    <button onClick={() => quitarAlumnoPool(a.id)} title="Quitar del pool">
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Crear grupo */}
                <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12 }}>
                    <h2 style={{ marginTop: 0 }}>Crear grupo</h2>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            style={{ flex: 1, padding: 8 }}
                            type="text"
                            placeholder="Nombre del grupo"
                            value={nuevoGrupo}
                            onChange={(e) => setNuevoGrupo(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && crearGrupo()}
                        />
                        <button onClick={crearGrupo}>Crear</button>
                    </div>
                    <p style={{ marginTop: 8, opacity: 0.7 }}>
                        Tip: crea varios grupos primero y luego usa “Auto-distribuir”.
                    </p>
                </div>
            </div>

            {/* Lista de grupos */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 16,
                }}
            >
                {grupos.map((g) => (
                    <div key={g.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0 }}>{g.nombre}</h3>
                            <button onClick={() => eliminarGrupo(g.id)} title="Eliminar grupo">
                                🗑️
                            </button>
                        </div>

                        {/* Asignar desde pool */}
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <select
                                style={{ flex: 1, padding: 8 }}
                                defaultValue=""
                                onChange={(e) => {
                                    const alumnoId = e.target.value;
                                    if (alumnoId) asignarAlumno(alumnoId, g.id);
                                    e.target.value = "";
                                }}
                            >
                                <option value="" disabled>
                                    Añadir alumno desde pool…
                                </option>
                                {alumnosOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Miembros */}
                        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
                            {g.miembros.length === 0 ? (
                                <li style={{ opacity: 0.7 }}>Sin miembros</li>
                            ) : (
                                g.miembros.map((m) => (
                                    <li key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                        <span>{m.nombre}</span>
                                        <button onClick={() => quitarDeGrupo(g.id, m.id)} title="Quitar del grupo">
                                            ✕
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
