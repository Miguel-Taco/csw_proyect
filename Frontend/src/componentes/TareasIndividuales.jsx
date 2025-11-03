import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/TareasIndividuales.css";
import InvitacionButton from "./InvitacionButton";
import CrearGrupoButton from "./CrearGrupoButton";

export default function TareasIndividuales() {
  const navigate = useNavigate();
  const { idSeccion } = useParams();
  
  const [activeTab, setActiveTab] = useState("individuales");
  const [alumnos, setAlumnos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    if (activeTab === "individuales") {
      cargarAlumnos();
    } else {
      cargarGrupos();
    }
  }, [idSeccion, activeTab]);

  const cargarAlumnos = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/alumnos-seccion/seccion/${idSeccion}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlumnos(data);
      } else {
        setError("Error al cargar los alumnos");
      }
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const cargarGrupos = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/grupos-seccion/seccion/${idSeccion}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Calcular promedio para cada grupo
        const gruposConPromedio = await Promise.all(
          data.map(async (grupo) => {
            try {
              const tareasResponse = await fetch(
                `${BASE_URL}/api/entregas/seccion/${idSeccion}/grupo/${grupo.idGrupo}/tareas-notas`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                }
              );
              
              if (tareasResponse.ok) {
                const tareas = await tareasResponse.json();
                
                // Calcular promedio de las notas
                if (tareas.length > 0) {
                  const notasValidas = tareas.filter(t => t.nota !== null && t.nota !== undefined);
                  if (notasValidas.length > 0) {
                    const suma = notasValidas.reduce((acc, t) => acc + t.nota, 0);
                    const promedio = suma / notasValidas.length;
                    return { ...grupo, promedioFinal: promedio };
                  }
                }
              }
              
              return { ...grupo, promedioFinal: null };
            } catch (err) {
              console.error(`Error al cargar tareas del grupo ${grupo.idGrupo}:`, err);
              return { ...grupo, promedioFinal: null };
            }
          })
        );
        
        setGrupos(gruposConPromedio);
      } else {
        setError("Error al cargar los grupos");
      }
    } catch (err) {
      console.error("Error al cargar grupos:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = () => {
    navigate(`/secciones/${idSeccion}/crear-tarea`);
  };

  const handleVolverASecciones = () => {
    navigate('/seccionesPage');
  };

  const handleAlumnoClick = (alumno) => {
    navigate(`/secciones/${idSeccion}/alumno/${alumno.idAlumno}/tareas`, {
      state: { 
        alumno: alumno,
        nombreSeccion: alumno.nombreCurso 
      }
    });
  };

  const handleGrupoClick = (grupo) => {
    navigate(`/secciones/${idSeccion}/grupo/${grupo.idGrupo}/tareas`, {
      state: { 
        grupo: grupo,
        nombreSeccion: `Sección ${idSeccion}`
      }
    });
  };

  const formatearNota = (nota) => {
    if (nota === null || nota === undefined) {
      return "Sin nota";
    }
    return Number(nota).toFixed(2);
  };
  
  return (
    <div className="tareas-container">
      <div className="header">
        <button 
          className="btn btn-secondary" 
          onClick={handleVolverASecciones}
          title="Volver a mis secciones"
        >
          ← Volver a Secciones
        </button>
        <InvitacionButton />
        <CrearGrupoButton />
        <button className="btn btn-primary" onClick={handleCrearTarea}>
          Crear Tarea
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "individuales" ? "active" : ""}`}
          onClick={() => setActiveTab("individuales")}
        >
          Tareas Individuales
        </button>
        <button
          className={`tab-button ${activeTab === "grupales" ? "active" : ""}`}
          onClick={() => setActiveTab("grupales")}
        >
          Tareas Grupales
        </button>
      </div>

      <div className="seccion-info">
        <h2>
          {activeTab === "individuales" 
            ? `Alumnos de la Sección ${idSeccion}` 
            : `Grupos de la Sección ${idSeccion}`
          }
        </h2>
        {activeTab === "individuales" && alumnos.length > 0 && (
          <p className="total-alumnos">Total: {alumnos.length} estudiante(s)</p>
        )}
        {activeTab === "grupales" && grupos.length > 0 && (
          <p className="total-alumnos">Total: {grupos.length} grupo(s)</p>
        )}
      </div>

      {loading ? (
        <div className="loading-message">Cargando...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="tabla-tareas">
          <thead>
            <tr>
              <th className="col-nota">Promedio</th>
              <th>
                {activeTab === "individuales" ? "Nombre Completo" : "Nombre del Grupo"}
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "individuales" ? (
              alumnos.length === 0 ? (
                <tr>
                  <td colSpan="2" className="vacio">
                    No hay estudiantes matriculados en esta sección
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => (
                  <tr 
                    key={alumno.idAlumno} 
                    className="alumno-row"
                    onClick={() => handleAlumnoClick(alumno)}
                    title="Click para ver tareas del alumno"
                  >
                    <td className="col-nota">
                      {formatearNota(alumno.promedioFinal)}
                    </td>
                    <td className="nombre-alumno">
                      {alumno.nombreCompleto}
                    </td>
                  </tr>
                ))
              )
            ) : (
              grupos.length === 0 ? (
                <tr>
                  <td colSpan="2" className="vacio">
                    No hay grupos creados en esta sección
                  </td>
                </tr>
              ) : (
                grupos.map((grupo) => (
                  <tr 
                    key={grupo.idGrupo} 
                    className="alumno-row grupo-row"
                    onClick={() => handleGrupoClick(grupo)}
                    title="Click para ver tareas del grupo"
                  >
                    <td className="col-nota">
                      {formatearNota(grupo.promedioFinal)}
                    </td>
                    <td className="nombre-grupo">
                      {grupo.nombreGrupo}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}