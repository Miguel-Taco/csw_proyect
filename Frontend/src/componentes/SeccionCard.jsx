import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "../styles/SeccionCard.css"

function SeccionCard({ seccion, onEliminar }) {
  const navigate = useNavigate();

  const handleEliminar = async (e) => {
    e.stopPropagation(); // Evitar que se active el click del card
    
    if (window.confirm(`¿Está seguro de eliminar la sección "${seccion.nombreCurso}"?`)) {
      await onEliminar(seccion.idSeccion);
    }
  };

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
    </div>
  );
}

SeccionCard.propTypes = {
  seccion: PropTypes.shape({
    idSeccion: PropTypes.number.isRequired,
    nombreCurso: PropTypes.string.isRequired,
    anio: PropTypes.number
  }).isRequired,
  onEliminar: PropTypes.func.isRequired,
};

export default SeccionCard;