import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/InvitacionModal.css";

export default function InvitacionModal({ open, onClose, title, children }) {
  if (!open) return null;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal( /*pintar por encima*/
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar" type="button">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>, 
    document.body
  );
}
