// InvitacionButton.jsx
import { useState } from "react";
import { useParams } from "react-router-dom"; // ✅ Import necesario
import "../styles/InvitacionButton.css";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

export default function InvitacionButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviadas, setEnviadas] = useState([]);

  const { user } = useAuth();
  const { idSeccion } = useParams(); // ✅ Captura el id de la URL
  const API_URL = "https://cswproyect-production.up.railway.app";

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    setEmail("");
    setMensaje("");
  };

  console.log("ID de la sección desde URL:", idSeccion);
  console.log("Usuario actual:", user.id);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "profesor") {
      setMensaje("Solo los profesores pueden enviar invitaciones.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMensaje("Por favor ingrese un correo válido.");
      return;
    }

    if (!idSeccion) {
      setMensaje("No se encontró el ID de la sección en la URL.");
      return;
    }

    setLoading(true);

    const data = {
      correoAlumno: email,
      idSeccion: Number(idSeccion),
      idProfesor: user.id
    };

    try {
      const response = await fetch(`${API_URL}/api/invitaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMensaje(result.message || "Invitación enviada correctamente 🎉");
        setEmail("");
        setTimeout(() => setMensaje(""), 3000);
        setEnviadas((prev) => [...prev, email]);
      } else {
        setMensaje(result.message || "Error al enviar la invitación");
      }
    } catch (error) {
      console.error("Error al enviar la invitación:", error);
      setMensaje("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="btn btn-primary btn-invitacion"
        onClick={openModal}
        type="button"
      >
        Invitar Alumno
      </button>

      <Modal open={open} onClose={closeModal} title="Invitar Alumno">
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Invitación"}
            </button>
          </div>
        </form>

        {mensaje && <p className="mensaje-feedback">{mensaje}</p>}

        {enviadas.length > 0 && (
          <div className="invitaciones-enviadas">
            <h4>Invitaciones enviadas:</h4>
            <ul>
              {enviadas.map((mail, i) => (
                <li key={i}>{mail}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  );
}
