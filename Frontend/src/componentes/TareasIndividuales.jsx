import "../styles/TareasIndividuales.css";

function TareasIndividuales() {
  return (
    <div className="tareas-container">
      {/* Botón Crear tarea */}
      <div className="header">
        <button className="crear-tarea-btn">Crear tarea</button>
      </div>

      {/* Tabla de estudiantes */}
      <table className="tabla-tareas">
        <thead>
          <tr>
            <th>Promedio</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {/* Por ahora vacío, luego se llenará dinámicamente */}
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

export default TareasIndividuales;