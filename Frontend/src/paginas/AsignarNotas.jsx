import "../styles/AsignarNotas.css";
import { useState } from "react";

function AsignarNotas() {
  // Datos de ejemplo (puedes reemplazarlos por datos del backend más adelante)
  const [tareas, setTareas] = useState([
    { id: 1, titulo: "TAREA - INDIVIDUAL 1", nota: 16 },
    { id: 2, titulo: "TAREA - INDIVIDUAL 2", nota: 20 },
    { id: 3, titulo: "TAREA - INDIVIDUAL 3", nota: 17 },
    { id: 4, titulo: "TAREA - INDIVIDUAL 4", nota: 12 },
    { id: 5, titulo: "TAREA - INDIVIDUAL 5", nota: 15 },
  ]);

  // Función para editar nota (si quieres hacer editable)
  const handleNotaChange = (id, value) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, nota: Number(value) || 0 } : t
      )
    );
  };

  return (
    <div className="asignarNotas-body">
      <div className="main-asignarNotas-container">
        
        {/* Encabezado: nombre del alumno */}
        <div className="asignarNotas-header">
          TACO ZAVALA MIGUEL ANGEL
        </div>

        {/* Lista scrolleable */}
        <div className="tareas-scroll">
          {tareas.map((tarea) => (
            <div className="tarea-item" key={tarea.id}>
              <div className="tarea-titulo">{tarea.titulo}</div>
              <div className="tarea-nota">
                {/* Si solo quieres mostrar la nota: */}
                {/* {tarea.nota} */}

                {/* Si quieres que sea editable: */}
                <input
                  type="number"
                  value={tarea.nota}
                  onChange={(e) =>
                    handleNotaChange(tarea.id, e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón de acción */}
        <button className="btn-asignarNotas">
          Guardar notas
        </button>
      </div>
    </div>
  );
}

export default AsignarNotas;