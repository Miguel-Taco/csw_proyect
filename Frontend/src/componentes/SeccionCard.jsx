import PropTypes from "prop-types";
import "../styles/SeccionCard.css";

function SeccionCard({ seccion, onEliminar, onEditar, onIrATareas }) {
  const handleEliminar = async (e) => {
    e.stopPropagation();
    
    if (globalThis.confirm(`¿Está seguro de eliminar la sección "${seccion.nombreCurso}"?

  Esto eliminará también todos los grupos, tareas y calificaciones asociadas.`)) {
      await onEliminar(seccion.idSeccion);
    }
  };

  const handleEditar = (e) => {
    e.stopPropagation();
    onEditar(seccion);
  };

  const handleIrATareas = () => {
    if (onIrATareas) {
      onIrATareas(seccion.idSeccion);
    }
  };

  return (
    <button className="seccion-card" onClick={handleIrATareas}>
      {/* Botones flotantes */}
      <div className="seccion-actions actions-top-right">
        <button
          onClick={handleEditar}
          className="btn-editar"
          title="Editar sección"
        >
          ✏️
        </button>
        <button
          onClick={handleEliminar}
          className="btn-eliminar"
          title="Eliminar sección"
        >
          ×
        </button>
      </div>

      {/* Texto centrado */}
      <p className="seccion-nombre">{seccion.nombreCurso}</p>
    </button>
  );
}

SeccionCard.propTypes = {
  seccion: PropTypes.shape({
    idSeccion: PropTypes.number.isRequired,
    nombreCurso: PropTypes.string.isRequired,
    anio: PropTypes.number.isRequired,
  }).isRequired,
  onEliminar: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onIrATareas: PropTypes.func,
};

export default SeccionCard;