import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/TareasIndividuales.css";
import InvitacionButton from "./InvitacionButton";

export default function TareasIndividuales() {
  const navigate = useNavigate();
  const { idSeccion } = useParams();
  
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const BASE_URL = 'https://cswproyect-production.up.railway.app';

  useEffect(() => {
    cargarAlumnos();
  }, [idSeccion]);

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

  const handleCrearTarea = () => {
    navigate(`/secciones/${idSeccion}/crear-tarea`);
  };

  const handleAlumnoClick = (alumno) => {
    // Guardar información del alumno seleccionado
    navigate(`/secciones/${idSeccion}/alumno/${alumno.idAlumno}/tareas`, {
      state: { 
        alumno: alumno,
        nombreSeccion: alumno.nombreCurso 
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
        <InvitacionButton />
        <button className="btn btn-primary" onClick={handleCrearTarea}>
          Crear Tarea
        </button>
      </div>

      <div className="seccion-info">
        <h2>Alumnos de la Sección {idSeccion}</h2>
        {alumnos.length > 0 && (
          <p className="total-alumnos">Total: {alumnos.length} estudiante(s)</p>
        )}
      </div>

      {loading ? (
        <div className="loading-message">Cargando alumnos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="tabla-tareas">
          <thead>
            <tr>
              <th className="col-nota">Promedio</th>
              <th>Nombre Completo</th>
              <th className="col-codigo">Código</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.length === 0 ? (
              <tr>
                <td colSpan="3" className="vacio">
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
                  <td className="col-codigo">
                    {alumno.codigoAlumno}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
