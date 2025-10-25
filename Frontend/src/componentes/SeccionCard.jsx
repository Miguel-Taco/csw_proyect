import PropTypes from "prop-types";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "../styles/SeccionCard.css"

function SeccionCard({ seccion, onEliminar }) {
  const navigate = useNavigate();

=======
import "../styles/SeccionCard.css";

function SeccionCard({ seccion, onEliminar, onEditar, onIrATareas }) {
>>>>>>> master
  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `¿Está seguro de eliminar la sección "${seccion.nombreCurso}"?\n\nEsto eliminará también todos los grupos, tareas y calificaciones asociadas.`
      )
    ) {
      await onEliminar(seccion.idSeccion);
    }
  };

<<<<<<< HEAD
  const handleClick = () => {
    // Guardar el ID de la sección en localStorage
    localStorage.setItem('seccionActual', JSON.stringify({
      idSeccion: seccion.idSeccion,
      nombreCurso: seccion.nombreCurso,
      anio: seccion.anio
    }));
    
    // Navegar a la página de tareas
    navigate('/tareasIndividuales');
  };

  return (
    <div className="seccion-card" onClick={handleClick}>
      <p>{seccion.nombreCurso}</p>
      <button onClick={handleEliminar}>x</button>
=======
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
    <div className="seccion-card" onClick={handleIrATareas}>
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
      <p className="seccion-anio">{seccion.anio}</p>
>>>>>>> master
    </div>
  );
}

SeccionCard.propTypes = {
  seccion: PropTypes.shape({
    idSeccion: PropTypes.number.isRequired,
    nombreCurso: PropTypes.string.isRequired,
<<<<<<< HEAD
    anio: PropTypes.number
=======
    anio: PropTypes.number.isRequired,
>>>>>>> master
  }).isRequired,
  onEliminar: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onIrATareas: PropTypes.func, // 🔹 Nueva prop opcional
};

export default SeccionCard;
