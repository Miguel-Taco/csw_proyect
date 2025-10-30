import { useNavigate, useParams } from "react-router-dom";
import "../styles/InvitacionButton.css";

export default function CrearGrupoButton() {
  const navigate = useNavigate();
  const { idSeccion } = useParams();

  const handleClick = () => {
    if (!idSeccion) {
      alert("No se encontró la sección. Asegúrate de estar dentro de una sección.");
      return;
    }

    // Navegar a la pantalla de asignación de grupos; la página se encargará de cargar alumnos si es necesario
    navigate('/asignacion-grupos', { state: { idSeccion: Number(idSeccion) } });
  };

  return (
    <button
      className="btn btn-primary btn-crear-grupo"
      type="button"
      onClick={handleClick}
      title="Crear grupo"
    >
      Crear Grupo
    </button>
  );
}
