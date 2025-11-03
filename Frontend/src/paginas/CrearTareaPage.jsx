import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormularioTarea from "../componentes/FormularioTarea";
import "../styles/CrearTareaPage.css";

export default function CrearTareaPage() {
  const navigate = useNavigate();
  const { idSeccion } = useParams();

  const handleVolver = () => {
    navigate(`/secciones/${idSeccion}/tareas`);
  };

  return (
    <div className="crear-tarea-page">
      <div className="crear-tarea-header">
        <button className="btn-volver" onClick={handleVolver}>
          ← Volver
        </button>
      </div>
      <FormularioTarea />
    </div>
  );
}
