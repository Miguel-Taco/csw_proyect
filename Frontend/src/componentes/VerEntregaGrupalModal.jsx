import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "../componentes/Modal";

export default function VerEntregaGrupalModal({ 
  open, 
  onClose, 
  idSeccion, 
  idGrupo, 
  idTarea,
  nombreTarea 
}) {
  const [loading, setLoading] = useState(false);
  const [entrega, setEntrega] = useState(null);
  const [error, setError] = useState("");

  const BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    if (open && idTarea) {
      cargarEntrega();
    }
  }, [open, idTarea]);

  const cargarEntrega = async () => {
    setLoading(true);
    setError("");
    setEntrega(null);

    try {
      const requestBody = {
        idSeccion: Number.parseInt(idSeccion, 10),
        idGrupo: Number.parseInt(idGrupo, 10),
        idTarea: idTarea
      };

      const response = await fetch(`${BASE_URL}/api/entregas/grupo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setEntrega(data);
        } else {
          setError(data.message || "No hay entrega disponible");
        }
      } else {
        setError("Error al obtener la entrega");
      }
    } catch (err) {
      console.error("Error al cargar entrega:", err);
      setError("Error de conexión al obtener la entrega");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirEnlace = () => {
    if (entrega?.enlace) {
      window.open(entrega.enlace, '_blank');
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={nombreTarea || "Ver Entrega"}
    >
      <div style={{ minWidth: '400px', padding: '10px 0' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Cargando entrega...
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {!loading && entrega && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <strong>Fecha de entrega:</strong>
              <div style={{ marginTop: '4px' }}>
                {entrega.fechaEntrega || 'No registrada'}
              </div>
            </div>

            {entrega.enlace && (
              <div>
                <strong>Enlace:</strong>
                <div style={{ 
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={entrega.enlace}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

VerEntregaGrupalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idSeccion: PropTypes.string.isRequired,
  idGrupo: PropTypes.string.isRequired,
  idTarea: PropTypes.number,
  nombreTarea: PropTypes.string
};