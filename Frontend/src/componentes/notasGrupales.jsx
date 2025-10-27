
/*import "../styles/NotasGrupales.css";
import { useState, useEffect } from "react";

function notasGrupales() {
  // Estado para integrantes
  const [integrantes, setIntegrantes] = useState([
    'Kevin',
    'Gerardo',
    'Miguel',
    '4',
    '5',
    '6',
    '7',
    '8'
  ]);

  // Estado para tareas del grupo
  const [tareas, setTareas] = useState([
    { id: 1, semana: 1, titulo: "SEMANA 1 - TAREA", nota: 20 },
    { id: 2, semana: 2, titulo: "SEMANA 2 - TAREA", nota: 20 },
    { id: 3, semana: 3, titulo: "SEMANA 3 - TAREA", nota: 17 },
    { id: 4, semana: 4, titulo: "SEMANA 4 - TAREA", nota: 12 },
    { id: 5, semana: 5, titulo: "SEMANA 5 - TAREA", nota: 11 }
  ]);

  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [grupoId, setGrupoId] = useState(1);

  // =============================================
  // FUNCIONES PARA CONECTAR CON EL BACKEND
  // =============================================

  // Cargar datos del grupo al montar el componente
  useEffect(() => {
    cargarDatosGrupo();
  }, [grupoId]);

  const cargarDatosGrupo = async () => {
    try {
      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch(`/api/grupos/${grupoId}`);
      // const data = await response.json();
      // setIntegrantes(data.integrantes);
      // setTareas(data.tareas);
      
      console.log(`Cargando datos del grupo ${grupoId}...`);
    } catch (error) {
      console.error("Error al cargar datos del grupo:", error);
    }
  };

  const handleAgregarIntegrante = async () => {
    const nuevoIntegrante = prompt("Ingrese el nombre del integrante:");
    if (!nuevoIntegrante) return;

    try {
      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch(`/api/grupos/${grupoId}/integrantes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nombre: nuevoIntegrante })
      // });
      // const data = await response.json();
      
      // Por ahora solo actualiza el estado local
      setIntegrantes([...integrantes, nuevoIntegrante]);
      console.log("Integrante agregado:", nuevoIntegrante);
    } catch (error) {
      console.error("Error al agregar integrante:", error);
    }
  };

  const handleSeleccionarTarea = (tarea) => {
    setTareaSeleccionada(tarea.id);
    // Aquí podrías navegar a otra vista o abrir un modal
    console.log("Tarea seleccionada:", tarea);
  };

  const handleVerDetalles = () => {
    if (!tareaSeleccionada) {
      alert("Por favor seleccione una tarea");
      return;
    }
    console.log("Ver detalles de tarea:", tareaSeleccionada);
    // TODO: Navegar a vista de detalles o abrir modal
  };

  return (
    <div className="grupoTrabajo-body">
      <div className="main-grupoTrabajo-container">
        
        {/* HEADER - Título del grupo */}
        <div className="grupoTrabajo-header">
          GRUPO DE TRABAJO {grupoId}
        </div>

        {/* CONTENIDO PRINCIPAL - Grid de dos columnas */}
        <div className="grupoTrabajo-content">
          
          {/* COLUMNA IZQUIERDA - INTEGRANTES */}
          <div className="integrantes-panel">
            <div className="integrantes-actions">
              <button className="btn-integrantes-tab">
                Integrantes
              </button>
              <button 
                className="btn-agregar"
                onClick={handleAgregarIntegrante}
              >
                Agregar
              </button>
            </div>

            {/* Lista scrolleable de integrantes */}
            <div className="integrantes-scroll">
              {integrantes.map((integrante, index) => (
                <div
                  key={index}
                  className="integrante-item"
                >
                  {integrante}
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA - TAREAS */}
          <div className="tareas-panel">
            <div className="tareas-scroll">
              {tareas.map((tarea) => (
                <div
                  key={tarea.id}
                  className={`tarea-item ${tareaSeleccionada === tarea.id ? 'tarea-seleccionada' : ''}`}
                  onClick={() => handleSeleccionarTarea(tarea)}
                >
                  <div className="tarea-titulo">
                    {tarea.titulo}
                  </div>
                  <div className="tarea-nota">
                    {tarea.nota}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button 
          className="btn-grupoTrabajo"
          onClick={handleVerDetalles}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}

export default GrupoTrabajo;*/