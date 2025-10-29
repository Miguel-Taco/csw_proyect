import React from "react";
import TareasIndividuales from "../componentes/TareasIndividuales";
import InvitacionButton from "../componentes/InvitacionButton";

export default function TareasIndividualesPage() {
  return (
    <div>
      <InvitacionButton />
      <h2>Tareas Individuales</h2>
      <TareasIndividuales />
    </div>
  );
}
