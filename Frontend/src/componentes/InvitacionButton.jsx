import { useState } from "react";
import "../styles/InvitacionButton.css";
import InvitacionModal from "./InvitacionModal";

export default function InvitacionButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const openModal = () => setOpen(true);
  const closeModal = () => { setOpen(false); setEmail(""); };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Invitar a:", email);
    closeModal();
  };

  return (
    <>
      <button className="btn btn-primary" onClick={openModal} type="button">
        Invitar Alumno
      </button>

      <InvitacionModal open={open} onClose={closeModal} title="Invitar Alumno">
        <form onSubmit={onSubmit} className="form-grid">
          <label className="field">
            <span>Correo del alumno</span>
            <input
              type="email"
              placeholder="alumno@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <div className="btn-group">
            <button type="button" className="btn" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar Invitación
            </button>
          </div>
        </form>
      </InvitacionModal>
    </>
  );
}
