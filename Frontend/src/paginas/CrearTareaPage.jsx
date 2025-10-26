import React from "react";
import { useNavigate } from "react-router-dom";
import FormularioTarea from "../componentes/FormularioTarea";

export default function CrearTareaPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/tareasIndividuales");
  };

  return (
    <div className="crear-tarea-page">
      <h2>Crear Tarea</h2>
      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px", margin: "0 auto" }} />
      <FormularioTarea onSuccess={handleSuccess} />
    </div>
  );
}
