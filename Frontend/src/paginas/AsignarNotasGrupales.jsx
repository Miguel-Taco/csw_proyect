import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../styles/AsignarNotasGrupales.css";

export default function AsignarNotasGrupales() {
  const navigate = useNavigate();
  const { idSeccion, idGrupo } = useParams();
  const location = useLocation();
  
  const [tareas, setTareas] = useState([]);
  const [integrantes, setIntegrantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  
  const BASE_URL = 'http://localhost:8080';
  
  const grupoInfo = location.state?.grupo || {};
  const nombreSeccion = location.state?.nombreSeccion || '';

  useEffect(() => {
    cargarDatosGrupo();
  }, [idSeccion, idGrupo]);

  const cargarDatosGrupo = async () => {
    setLoading(true);
    setError("");
    setMessage(null);
    
    try {
      // Cargar tareas y integrantes en paralelo
      const [tareasResponse, integrantesResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/entregas/seccion/${idSeccion}/grupo/${idGrupo}/tareas-notas`),
        fetch(`${BASE_URL}/api/entregas/grupo/${idGrupo}/integrantes`)
      ]);

      if (tareasResponse.ok && integrantesResponse.ok) {
        const tareasData = await tareasResponse.json();
        const integrantesData = await integrantesResponse.json();
        
        // Normalizar tareas
        const normalized = tareasData.map((t) => ({
          idTarea: t.idTarea,
          idEntrega: t.idEntrega,
          titulo: t.nombreTarea,
          nota: t.nota === null ? "" : Number(t.nota),
        }));
        
        setTareas(normalized);
        setIntegrantes(integrantesData);
      } else {
        if (!tareasResponse.ok) {
          setError("Error al cargar las tareas grupales");
        }
        if (!integrantesResponse.ok) {
          setError("Error al cargar los integrantes del grupo");
        }
      }
    } catch (err) {
      console.error("Error al cargar datos del grupo:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleNotaChange = (idTarea, value) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.idTarea === idTarea 
          ? { ...t, nota: value === "" ? "" : Number(value) } 
          : t
      )
    );
  };

  const validarNotas = () => {
    for (const t of tareas) {
      if (t.nota !== "" && (Number.isNaN(t.nota) || t.nota < 0 || t.nota > 20)) {
        return { valido: false, mensaje: `Nota inválida en "${t.titulo}"` };
      }
    }
    return { valido: true, mensaje: "" };
  };

  const actualizarEntrega = async (tarea) => {
    const response = await fetch(
      `${BASE_URL}/api/entregas/${tarea.idEntrega}/nota`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nota: tarea.nota === "" ? null : tarea.nota }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error al actualizar "${tarea.titulo}": ${errText}`);
    }
  };

  const crearEntrega = async (tarea) => {
    const payload = {
      idTarea: tarea.idTarea,
      idGrupo: Number.parseInt(idGrupo, 10),
      nota: tarea.nota === "" ? null : tarea.nota,
    };

    const response = await fetch(
      `${BASE_URL}/api/entregas/grupal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const created = await response.json();
      setTareas((prev) =>
        prev.map((p) =>
          p.idTarea === tarea.idTarea 
            ? { ...p, idEntrega: created.idEntrega } 
            : p
        )
      );
    } else {
      const errText = await response.text();
      throw new Error(`Error al crear entrega para "${tarea.titulo}": ${errText}`);
    }
  };

  const procesarTarea = async (tarea) => {
    if (tarea.idEntrega) {
      await actualizarEntrega(tarea);
    } else {
      await crearEntrega(tarea);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    setMessage(null);
    setError("");

    const validacion = validarNotas();
    if (!validacion.valido) {
      setMessage({ type: "error", text: validacion.mensaje });
      setSaving(false);
      return;
    }

    try {
      for (const tarea of tareas) {
        await procesarTarea(tarea);
      }

      setMessage({ type: "success", text: "Notas guardadas correctamente." });
      
      setTimeout(() => {
        cargarDatosGrupo();
      }, 1000);

    } catch (err) {
      console.error("Error guardando notas:", err);
      setError(err.message || "Error al guardar las notas");
    } finally {
      setSaving(false);
    }
  };

  const handleVolver = () => {
    navigate(`/secciones/${idSeccion}/tareas`);
  };

  const formatearNota = (nota) => {
    if (nota === null || nota === undefined || nota === "") {
      return "";
    }
    const numero = Number(nota);
    return Number.isNaN(numero) ? "" : String(numero);
  };

  const calcularPromedio = () => {
    const notasValidas = tareas.filter(t => t.nota !== "" && t.nota !== null);
    if (notasValidas.length === 0) return "Sin notas";
    const suma = notasValidas.reduce((acc, t) => acc + Number(t.nota), 0);
    return (suma / notasValidas.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="asignarNotasGrupales-body">
        <div className="loading-message-grupal">Cargando información del grupo...</div>
      </div>
    );
  }

  return (
    <div className="asignarNotasGrupales-body">
      <div className="main-asignarNotasGrupales-container">
        {/* Header */}
        <div className="asignarNotasGrupales-header">
          <div className="header-info-grupal">
            <h2>{grupoInfo.nombreGrupo || `Grupo ${idGrupo}`}</h2>
            {nombreSeccion && (
              <p className="nombre-grupo-header">{nombreSeccion}</p>
            )}
          </div>
          <button className="btn-volver-grupal" onClick={handleVolver}>
            ← Volver
          </button>
        </div>

        {/* Mensajes */}
        {message && (
          <div
            className={`message-grupal ${message.type === "error" ? "message-error-grupal" : "message-success-grupal"}`}
          >
            {message.text}
          </div>
        )}

        {error && (
          <div className="error-message-grupal">{error}</div>
        )}

        {/* Contenido principal: 2 columnas */}
        <div className="contenido-grupo">
          {/* Columna izquierda: Integrantes */}
          <div className="integrantes-panel">
            <div className="integrantes-header">
              <h3>Integrantes del Grupo</h3>
            </div>
            <div className="integrantes-lista">
              {integrantes.length === 0 ? (
                <div className="vacio-grupal">No hay integrantes</div>
              ) : (
                integrantes.map((integrante, index) => (
                  <div key={index} className="integrante-item">
                    <span className="integrante-numero">{index + 1}.</span>
                    <span className="integrante-nombre">{integrante.nombreCompleto}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna derecha: Tareas */}
          <div className="tareas-panel">
            {/* Stats card */}
            <div className="stats-card-grupal">
              <div className="stat-item-grupal">
                <div className="stat-label-grupal">Promedio Actual</div>
                <div className="stat-value-grupal">{calcularPromedio()}</div>
              </div>
              <div className="stat-item-grupal">
                <div className="stat-label-grupal">Total de Tareas</div>
                <div className="stat-value-grupal">{tareas.length}</div>
              </div>
            </div>

            {/* Lista de tareas */}
            <div className="tareas-scroll-grupal">
              {tareas.length === 0 ? (
                <div className="vacio-grupal">No hay tareas grupales registradas</div>
              ) : (
                tareas.map((tarea, index) => (
                  <div className="tarea-item-grupal" key={tarea.idTarea}>
                    <div className="tarea-titulo-wrapper-grupal">
                      <div className="tarea-numero-grupal">TAREA GRUPAL {index + 1}</div>
                      <div className="tarea-titulo-grupal">{tarea.titulo}</div>
                    </div>
                    <div className="tarea-nota-grupal">
                      <button>Ver Entrega</button>
                      <span className="nota-label-grupal">Nota:</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={formatearNota(tarea.nota)}
                        placeholder="0.0"
                        onChange={(e) => handleNotaChange(tarea.idTarea, e.target.value)}
                        disabled={saving}
                      />
                      <span className="nota-max-grupal">/ 20</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              className="btn-asignarNotasGrupales" 
              onClick={handleGuardar} 
              disabled={saving || tareas.length === 0}
            >
              {saving ? "Guardando..." : "💾 Guardar notas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}