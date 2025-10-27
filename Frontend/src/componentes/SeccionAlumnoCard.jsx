import PropTypes from "prop-types";
import "../styles/SeccionAlumnoCard.css";
import { useNavigate } from "react-router-dom";

function SeccionCard({ seccion }) {
  const navigate = useNavigate();

  const handleClick = () => {
        navigate(`/alumno/seccion/${seccion.idSeccion}/tareas`);
    };
  return (
    <div className="seccion-card" onClick={handleClick} style={{ cursor: 'pointer' }}>

      {/* Texto centrado */}
      <div className="seccion-card-data">
        <p className="seccion-nombre">{seccion.nombreCurso}{seccion.anio}</p>
      </div>
      <p className="seccion-profesor">Profesor: {seccion.nombreProfesor}</p>
      <p></p>
    </div>
  );
}

SeccionCard.propTypes = {
  seccion: PropTypes.shape({
    idSeccion: PropTypes.number.isRequired,
    nombreCurso: PropTypes.string.isRequired,
    anio: PropTypes.number.isRequired,
  }).isRequired
};

export default SeccionCard;
