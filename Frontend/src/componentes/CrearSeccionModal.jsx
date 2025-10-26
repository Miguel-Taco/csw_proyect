import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/Modal.css"; // Reutilizamos el mismo CSS

export default function CrearSeccionModal({ open, onClose, onCrear, anioActual }) {
  const dialogRef = useRef(null);
  const [nombreSeccion, setNombreSeccion] = useState("");
  const [error, setError] = useState("");

  CrearSeccionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCrear: PropTypes.func.isRequired,
    anioActual: PropTypes.number.isRequired,
  };

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      setNombreSeccion(""); // Limpiar al abrir
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

    onCrear(nombreSeccion.trim());
    setNombreSeccion("");
    setError("");
  };

  return createPortal(
    <dialog ref={dialogRef} className="modal" onCancel={onClose}>
      <div className="modal-header">
        <h2 id="modal-title">Crear Nueva Sección</h2>
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
            <small style={{ color: '#666', fontSize: '12px' }}>
              Año: {anioActual}
            </small>
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
              Crear Sección
            </button>
          </div>
        </form>
      </div>
    </dialog>,
    document.body
  );
}