import React from "react";
import TareasIndividuales from "../componentes/TareasIndividuales";
import CrearGrupoButton from "../componentes/CrearGrupoButton";
import AsignarNotas from "./AsignarNotas";

export default function TareasIndividualesPage() {
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      </div>
      <h2>Tareas Individuales</h2>
      <TareasIndividuales />
    </div>
  );
}
