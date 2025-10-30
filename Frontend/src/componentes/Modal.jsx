// Modal.jsx (componente genérico)
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../styles/Modal.css";

export default function Modal({
  open,
  onClose,
  title,
  children,
  disableBackdropClose = false,
}) {
  const dialogRef = useRef(null);

  Modal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.node,
    disableBackdropClose: PropTypes.bool,
  };

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Método separado para manejar el cierre
  const handleClose = () => {
    onClose();
  };

  // Método separado para prevenir el cierre
  const preventClose = (e) => {
    e.preventDefault();
  };

  // Determinar qué manejador usar basado en la configuración
  const handleCancel = disableBackdropClose ? preventClose : handleClose;

  const handleBackdropClick = (e) => {
    if (disableBackdropClose) return;

    const dialog = dialogRef.current;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;

    if (clickedOutside) {
      handleClose();
    }
  };

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-btn"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </dialog>,
    document.body
  );
}