import { useState } from "react";
import "../styles/SubirTareas.css";

/**
 * Modal para que los alumnos suban una tarea (archivo o link) asociada a su grupo.
 * * @param {object} props
 * @param {object} props.grupo - Objeto del grupo (ej: { idGrupo: 1, nombreGrupo: "Grupo A" })
 * @param {function} props.onClose - Función para cerrar el modal
 */
function SubirTareas({ grupo, onClose }) {
    const [link, setLink] = useState("");
    const [archivo, setArchivo] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const BASE_URL = "http://localhost:8080"; // Base de tu API

    const handleSubir = async () => {
        // 1. Validación de entrada
        if (!archivo && !link.trim()) {
            alert("Selecciona un archivo o pega un enlace");
            return;
        }

        setSubiendo(true);

        try {
            // 2. Preparación de FormData para envío de archivos y datos
            const form = new FormData();

            // El grupoId se envía en el cuerpo, además de la URL, por si el backend lo requiere
            // (Se puede omitir si el backend solo usa el parámetro de la URL)
            // form.append("grupoId", grupo.idGrupo);

            if (archivo) form.append("file", archivo);
            if (link.trim()) form.append("link", link.trim());

            // 3. Petición POST al endpoint de tareas grupales
            const res = await fetch(`${BASE_URL}/api/grupos/${grupo.idGrupo}/tareas`, {
                method: "POST",
                body: form,
            });

            // 4. Manejo de errores de la respuesta HTTP
            if (!res.ok) {
                // Intenta obtener un mensaje de error detallado
                const errorText = await res.text().catch(() => "Error desconocido");
                throw new Error(`[${res.status}] Error al subir tarea: ${errorText}`);
            }

            // 5. Éxito
            alert("✅ Tarea subida correctamente");
            setArchivo(null);
            setLink("");
            onClose?.(); // Cierra el modal si onClose está definido

        } catch (e) {
            // 6. Manejo de errores generales (red, parseo, etc.)
            console.error("Error en handleSubir:", e);
            alert(`No se pudo subir la tarea. ${e.message ? "Detalles: " + e.message.substring(0, 100) : ""}`);
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="subirTareas-body">
            {/* Cierra el modal al hacer clic en el overlay, pero previene si se está subiendo */}
            <div className="subirTareas-overlay" onClick={subiendo ? null : onClose} />
            <div className="subirTareas-modal">
                <header className="subirTareas-header">
                    {/* Muestra el nombre del grupo en el título */}
                    <h1>ARCHIVOS O LINKS — {grupo?.nombreGrupo || "Grupo"}</h1>
                    <button
                        className="subirTareas-upload"
                        onClick={handleSubir}
                        disabled={subiendo || (!archivo && !link.trim())} // Deshabilitar si está subiendo o no hay nada
                    >
                        {subiendo ? "Subiendo..." : "Subir"}
                    </button>
                    {/* Botón de cierre explícito, útil para cuando el overlay tiene un handler más complejo */}
                    <button className="subirTareas-close" onClick={onClose} disabled={subiendo}>✖</button>
                </header>

                <div className="subirTareas-content">
                    <section className="subirTareas-panel">
                        <p className="subirTareas-helper">
                            Pega el enlace de tu documento o selecciona un archivo.
                        </p>

                        {/* Input de tipo archivo */}
                        <input
                            type="file"
                            onChange={(e) => {
                                setArchivo(e.target.files?.[0] || null);
                                if (e.target.files?.[0]) setLink(""); // Limpia link si se selecciona archivo
                            }}
                            style={{ marginBottom: 8 }}
                            disabled={subiendo}
                        />
                        {/* Muestra el nombre del archivo seleccionado */}
                        {archivo && <p style={{fontSize: '0.8em', color: '#555'}}>Archivo a subir: <b>{archivo.name}</b></p>}


                        {/* Input para el enlace */}
                        <input
                            type="text"
                            className="subirTareas-link"
                            value={link}
                            onChange={(e) => {
                                setLink(e.target.value);
                                setArchivo(null); // Limpia archivo si se introduce un link
                            }}
                            placeholder="Ej: https://docs.google.com/..."
                            disabled={subiendo || !!archivo} // Deshabilitar si se está subiendo o ya hay archivo
                        />
                    </section>

                    <aside className="subirTareas-description">
                        <h2>Instrucciones</h2>
                        <p>
                            Los archivos y enlaces se asociarán al grupo <b>{grupo?.nombreGrupo || "N/A"}</b>.
                            Asegúrate de que el enlace sea accesible o que el archivo sea el correcto.
                        </p>
                        {/* Botón de cierre en el cuerpo */}
                        <button
                            className="subirTareas-close-button" // Nueva clase para diferenciar estilos
                            onClick={onClose}
                            disabled={subiendo}
                            style={{ marginTop: 8 }}
                        >
                            Cerrar
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default SubirTareas;