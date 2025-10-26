import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/Modal.css";

export default function EditarSeccionModal({ open, onClose, onEditar, seccion, anioActual }) {
  const dialogRef = useRef(null);
  const [nombreSeccion, setNombreSeccion] = useState("");
  const [anioSeccion, setAnioSeccion] = useState(anioActual);
  const [error, setError] = useState("");

  EditarSeccionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onEditar: PropTypes.func.isRequired,
    seccion: PropTypes.object,
    anioActual: PropTypes.number.isRequired,
  };

  useEffect(() => {
    if (seccion) {
      setNombreSeccion(seccion.nombreCurso || "");
      setAnioSeccion(seccion.anio || anioActual);
    }
  }, [seccion, anioActual]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      setError("");
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nombreSeccion.trim()) {
      setError("El nombre de la sección es obligatorio");
      return;
    }

    if (nombreSeccion.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    // Verificar si no hubo cambios
    if (nombreSeccion.trim() === seccion.nombreCurso && anioSeccion === seccion.anio) {
      setError("No se realizaron cambios");
      return;
    }

    onEditar(seccion.idSeccion, nombreSeccion.trim(), anioSeccion);
    setError("");
  };

  // Generar opciones de años (actual y futuros)
  const generarOpcionesAnios = () => {
    const anios = [];
    for (let i = 0; i < 5; i++) {
      anios.push(anioActual + i);
    }
    return anios;
  };

  return createPortal(
    <dialog ref={dialogRef} className="modal" onCancel={onClose}>
      <div className="modal-header">
        <h2 id="modal-title">Editar Sección</h2>
        <button
          className="icon-btn"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>
      </div>

      <div className="modal-body">
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span>Nombre del curso o sección</span>
            <input
              type="text"
              placeholder="Ej: CALIDAD DE SOFTWARE - G1"
              value={nombreSeccion}
              onChange={(e) => {
                setNombreSeccion(e.target.value);
                setError("");
              }}
              autoFocus
              maxLength={40}
            />
          </label>

          <label className="field">
            <span>Año académico</span>
            <select
              value={anioSeccion}
              onChange={(e) => {
                setAnioSeccion(Number(e.target.value));
                setError("");
              }}
            >
              {generarOpcionesAnios().map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </label>

          {error && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '14px', 
              padding: '8px', 
              backgroundColor: '#f8d7da',
              borderRadius: '6px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <div className="btn-group">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>,
    document.body
  );
}