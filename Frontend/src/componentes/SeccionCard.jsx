import PropTypes from "prop-types";
import "../styles/SeccionCard.css";

function SeccionCard({ seccion, onEliminar, onEditar }) {
  const handleEliminar = async (e) => {
    e.stopPropagation();
    
    if (window.confirm(`¿Está seguro de eliminar la sección "${seccion.nombreCurso}"?

  Esto eliminará también todos los grupos, tareas y calificaciones asociadas.`)) {
      await onEliminar(seccion.idSeccion);
    }
  };

  const handleEditar = (e) => {
    e.stopPropagation();
    onEditar(seccion);
  };

  return (
    <div className="seccion-card">
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
    </div>
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
};

export default SeccionCard;