import PropTypes from "prop-types";
import "../styles/SeccionAlumnoCard.css";

function SeccionCard({ seccion}) {

  return (
    <div className="seccion-card" >

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
