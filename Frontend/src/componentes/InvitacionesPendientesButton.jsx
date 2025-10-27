import { useState, useEffect } from "react";
import "../styles/InvitacionButton.css";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

export default function InvitacionesPendientesButton() {
  const [open, setOpen] = useState(false);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  const { user } = useAuth();
  const API_URL = 'https://cswproyect-production.up.railway.app';

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    setMensaje("");
  };

  useEffect(() => {
    if (open && user?.role === "alumno") {
      cargarInvitaciones();
    }
  }, [open]);

  const cargarInvitaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/invitaciones/pendientes?correo=${encodeURIComponent(user.email)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setInvitaciones(result.data || []);
      } else {
        setMensaje(result.message || "Error al cargar invitaciones");
      }
    } catch (error) {
      console.error("Error al cargar invitaciones:", error);
      setMensaje("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const manejarRespuesta = async (token, accion) => {
    try {
        // Solo procesamos si acepta, porque el endpoint actual es para aceptar
        if (accion === "aceptada") {
        const response = await fetch(`${API_URL}/api/invitaciones/confirmar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            token: token,
            idAlumno: user.id, // en sí, sería el idPersona pero en el backend lo manejamos como idAlumno
            }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setMensaje("Invitación aceptada correctamente 🎉");
            setInvitaciones((prev) =>
            prev.filter((inv) => inv.token !== token)
            );
        } else {
            setMensaje(result.message || "Error al aceptar invitación");
        }
        } else {
        // Podrías agregar aquí tu endpoint de rechazo si lo implementas luego
        setMensaje("Invitación rechazada ❌");
        }
    } catch (error) {
        console.error("Error al confirmar invitación:", error);
        setMensaje("Error de conexión. Inténtalo de nuevo.");
    } finally {
        setTimeout(() => setMensaje(""), 3000);
    }
  };


  if (!user || user.role !== "alumno") {
    return null;
  }
  
  const renderModalContent = () => {
    if (loading) {
      return <p className="texto-centrado">Cargando...</p>;
    }

    if (invitaciones.length === 0) {
      return (
        <p className="texto-centrado">
          No tienes invitaciones pendientes
        </p>
      );
    }

    // Si no está cargando y hay invitaciones
    return (
      <div className="invitaciones-lista">
        {invitaciones.map((inv) => (
          <div key={inv.id} className="invitacion-card">
            <div className="invitacion-info">
              <h4>Sección: {inv.nombreCurso || `Sección ${inv.idSeccion}`}</h4>
              <p><strong>Profesor:</strong> {inv.nombreProfesor}</p>
              <p><strong>Curso:</strong> {inv.nombreCurso}</p>
              <p className="fecha-invitacion">
                Enviada el {new Date(inv.fechaCreacion).toLocaleDateString()}
              </p>
            </div>
            
            <div className="btn-group">
              <button
                className="btn btn-success"
                onClick={() => manejarRespuesta(inv.token, "aceptada")}
              >
                Aceptar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => manejarRespuesta(inv.token, "rechazada")}
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <button 
        className="btn btn-primary btn-invitacion" 
        onClick={openModal} 
        type="button"
      >
        Ver Invitaciones Pendientes
        {invitaciones.length > 0 && (
          <span className="badge">{invitaciones.length}</span>
        )}
      </button>

      <Modal 
        open={open} 
        onClose={closeModal}
        title="Invitaciones Pendientes"
        disableBackdropClose={true}
      >
        {renderModalContent()}

        {mensaje && (
          <p className="mensaje-feedback">
            {mensaje}
          </p>
        )}
      </Modal>
    </>
  );
}