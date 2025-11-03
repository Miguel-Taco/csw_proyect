import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/VerGrupoAlumno.css";

export default function VerGrupoAlumno() {
  const navigate = useNavigate();
  const { idSeccion } = useParams();
  const { user } = useAuth();
  
  const [grupoInfo, setGrupoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sinGrupo, setSinGrupo] = useState(false);
  
  const BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    if (user?.idAlumno && idSeccion) {
      cargarGrupoInfo();
    }
  }, [user, idSeccion]);

  const cargarGrupoInfo = async () => {
    setLoading(true);
    setError("");
    setSinGrupo(false);
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/alumno-grupo/alumno/${user.idAlumno}/seccion/${idSeccion}`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Verificar si tiene mensaje de error (no pertenece a grupo)
        if (data.mensaje) {
          setSinGrupo(true);
          setError(data.mensaje);
        } else {
          setGrupoInfo(data);
        }
      } else {
        setError("Error al cargar información del grupo");
      }
    } catch (err) {
      console.error("Error al cargar grupo:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(`/alumno/seccion/${idSeccion}/tareas`);
  };

  const calcularPromedio = () => {
    if (!grupoInfo || !grupoInfo.tareas || grupoInfo.tareas.length === 0) {
      return "Sin notas";
    }
    
    const notasValidas = grupoInfo.tareas.filter(t => t.nota !== null && t.nota > 0);
    if (notasValidas.length === 0) return "Sin notas";
    
    const suma = notasValidas.reduce((acc, t) => acc + t.nota, 0);
    return (suma / notasValidas.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="verGrupoAlumno-body">
        <div className="loading-message-alumno">Cargando información del grupo...</div>
      </div>
    );
  }

  if (sinGrupo) {
    return (
      <div className="verGrupoAlumno-body">
        <div className="sin-grupo-container">
          <div className="sin-grupo-icon">👥</div>
          <h2>No perteneces a ningún grupo</h2>
          <p>{error}</p>
          <button className="btn-volver-alumno" onClick={handleVolver}>
            ← Volver a Tareas
          </button>
        </div>
      </div>
    );
  }

  if (error && !sinGrupo) {
    return (
      <div className="verGrupoAlumno-body">
        <div className="error-container-alumno">
          <div className="error-message-alumno">{error}</div>
          <button className="btn-volver-alumno" onClick={handleVolver}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  if (!grupoInfo) {
    return (
      <div className="verGrupoAlumno-body">
        <div className="error-message-alumno">No se pudo cargar la información del grupo</div>
      </div>
    );
  }

  return (
    <div className="verGrupoAlumno-body">
      <div className="main-verGrupoAlumno-container">
        {/* Header */}
        <div className="verGrupoAlumno-header">
          <div className="header-info-alumno">
            <h2>{grupoInfo.nombreGrupo}</h2>
            {grupoInfo.nombreSeccion && (
              <p className="nombre-seccion-header">{grupoInfo.nombreSeccion}</p>
            )}
          </div>
          <button className="btn-volver-alumno" onClick={handleVolver}>
            ← Volver
          </button>
        </div>

        {/* Badge de solo lectura */}
        <div className="badge-solo-lectura">
          🔒 Vista de solo lectura
        </div>

        {/* Contenido principal: 2 columnas */}
        <div className="contenido-grupo-alumno">
          {/* Columna izquierda: Integrantes */}
          <div className="integrantes-panel-alumno">
            <div className="integrantes-header-alumno">
              <h3>Integrantes del Grupo</h3>
              <span className="badge-cantidad">
                {grupoInfo.cantidadIntegrantes} {grupoInfo.cantidadIntegrantes === 1 ? 'integrante' : 'integrantes'}
              </span>
            </div>
            <div className="integrantes-lista-alumno">
              {grupoInfo.integrantes && grupoInfo.integrantes.length > 0 ? (
                grupoInfo.integrantes.map((integrante, index) => (
                  <div 
                    key={integrante.idAlumno} 
                    className={`integrante-item-alumno ${integrante.idAlumno === user.idAlumno ? 'es-tu' : ''}`}
                  >
                    <span className="integrante-numero-alumno">{index + 1}</span>
                    <div className="integrante-info">
                      <span className="integrante-nombre-alumno">
                        {integrante.nombreCompleto}
                        {integrante.idAlumno === user.idAlumno && (
                          <span className="badge-tu"> (Tú)</span>
                        )}
                      </span>
                      <span className="integrante-codigo">{integrante.codigoAlumno}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="vacio-alumno">No hay integrantes</div>
              )}
            </div>
          </div>

          {/* Columna derecha: Tareas */}
          <div className="tareas-panel-alumno">
            {/* Stats card */}
            <div className="stats-card-alumno">
              <div className="stat-item-alumno">
                <div className="stat-label-alumno">Promedio Actual</div>
                <div className="stat-value-alumno">{calcularPromedio()}</div>
              </div>
              <div className="stat-item-alumno">
                <div className="stat-label-alumno">Total de Tareas</div>
                <div className="stat-value-alumno">{grupoInfo.totalTareas || 0}</div>
              </div>
            </div>

            {/* Lista de tareas */}
            <div className="tareas-scroll-alumno">
              {!grupoInfo.tareas || grupoInfo.tareas.length === 0 ? (
                <div className="vacio-alumno">No hay tareas grupales registradas</div>
              ) : (
                grupoInfo.tareas.map((tarea, index) => (
                  <div className="tarea-item-alumno" key={tarea.idTarea}>
                    <div className="tarea-titulo-wrapper-alumno">
                      <div className="tarea-numero-alumno">TAREA GRUPAL {index + 1}</div>
                      <div className="tarea-titulo-alumno">{tarea.nombreTarea}</div>
                      {tarea.fechaEntrega && (
                        <div className="tarea-fecha">
                          📅 Entregado: {new Date(tarea.fechaEntrega).toLocaleDateString('es-PE')}
                        </div>
                      )}
                    </div>
                    <div className="tarea-nota-alumno">
                      <span className="nota-label-alumno">Nota:</span>
                      <div className={`nota-display ${tarea.nota === null ? 'sin-nota' : ''}`}>
                        {tarea.nota !== null ? tarea.nota.toFixed(1) : 'Sin nota'}
                      </div>
                      <span className="nota-max-alumno">/ 20</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}