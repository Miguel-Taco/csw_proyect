import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TareasIndividuales.css";

export default function TareaIndividual() {
  const navigate = useNavigate();

  const handleCrearTarea = () => {
    navigate("/CrearTareaPage");
  };

  return (
    <div className="tareas-container">
      <div className="header">
        <button className="btn btn-primary" onClick={handleCrearTarea}>
          Crear Tarea
          </button>
      </div>

      <table className="tabla-tareas">
        <thead>
          <tr>
            <th className="col-nota">Nota</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="2" className="vacio">
              No hay estudiantes todavía
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
