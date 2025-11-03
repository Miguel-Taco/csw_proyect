// ModalVerEntrega.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import "../styles/VerEntregaModal.css";

export default function ModalVerEntrega({ 
  open, 
  onClose, 
  idSeccion, 
  idAlumno, 
  tarea 
}) {
  const [entregaData, setEntregaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const BASE_URL = 'http://localhost:8080';

  ModalVerEntrega.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    idSeccion: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    idAlumno: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tarea: PropTypes.shape({
      idTarea: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
    }),
  };

  useEffect(() => {
    if (open && tarea) {
      cargarEntrega();
    } else {
      // Limpiar datos cuando se cierra el modal
      setEntregaData(null);
      setError("");
    }
  }, [open, tarea]);

  const cargarEntrega = async () => {
    setLoading(true);
    setError("");
    setEntregaData(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/entregas/seccion/${idSeccion}/alumno/${idAlumno}/tarea/${tarea.idTarea}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntregaData(data);
      } else if (response.status === 404) {
        setError("El alumno aún no ha realizado esta entrega");
      } else {
        const errorText = await response.text();
        console.error(`Error ${response.status}:`, errorText);
        setError(`Error al cargar la entrega (${response.status})`);
      }
    } catch (err) {
      console.error("Error al cargar entrega:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "No especificada";
    
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return fechaString;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="modal-entrega-loading">
          <div className="spinner"></div>
          <p>Cargando entrega...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="modal-entrega-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      );
    }

    if (!entregaData) {
      return (
        <div className="modal-entrega-empty">
          <p>No hay información disponible</p>
        </div>
      );
    }

    return (
      <div className="modal-entrega-content">
        <div className="entrega-info-card">
          <div className="info-row">
            <span className="info-label">📝 Tarea:</span>
            <span className="info-value">{tarea?.titulo}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">📅 Fecha de entrega:</span>
            <span className="info-value">
              {formatearFecha(entregaData.fechaEntrega)}
            </span>
          </div>
          
          <div className="info-row">
            <span className="info-label">🔗 Enlace: {entregaData.enlace}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Detalle de Entrega"
    >
      {renderContent()}
    </Modal>
  );
}