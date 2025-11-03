import { useState, useEffect } from "react";
import Modal from "../componentes/Modal";
import { useAuth } from "../context/AuthContext";
import "../styles/SubirTareas.css";

function SubirTareas({ open, onClose, tarea }) {
  const { user } = useAuth();
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const BASE_URL = 'http://localhost:8080';

  // Verificar si existe una entrega previa cuando se abre el modal
  useEffect(() => {
    if (open && tarea && user?.id) {
      verificarEntregaExistente();
    }
  }, [open, tarea, user?.id]);

  const verificarEntregaExistente = async () => {
    setVerificando(true);
    try {
      const response = await fetch(`${BASE_URL}/api/entregas/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPersona: user.id,
          idTarea: tarea?.idTarea
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.existe && data.enlace) {
          setLink(data.enlace);
          setIsUpdating(true);
          console.log("Entrega previa encontrada:", data);
        } else {
          setLink("");
          setIsUpdating(false);
        }
      }
    } catch (err) {
      console.error("Error al verificar entrega:", err);
      setLink("");
      setIsUpdating(false);
    } finally {
      setVerificando(false);
    }
  };

  const handleSubir = async () => {
    if (!link.trim()) {
      alert("Por favor, ingresa un enlace válido");
      return;
    }

    if (!user?.id) {
      alert("No se encontró información del usuario");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/api/entregas/guardar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idPersona: user.id,
          idTarea: tarea?.idTarea,
          enlace: link
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.mensaje);
        onClose();
      } else {
        alert(data.mensaje || "Error al procesar la entrega");
      }
    } catch (err) {
      console.error("Error al subir entrega:", err);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar el estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setLink("");
      setIsUpdating(false);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="LINK DE LA ENTREGA">
      <div className="subirTareas-content">
        <div className="subirTareas-actions">
          <section className="subirTareas-panel">
            <p className="subirTareas-helper">
              {verificando ? (
                <>Cargando información...</>
              ) : (
                <>
                  {isUpdating ? 'Actualizando' : 'Entregando'} la tarea: <strong>{tarea?.nombre || "Cargando..."}</strong><br/>
                  <strong>Instrucciones:</strong> Pega el enlace de tu documento directamente en el cuadro de abajo.
                </>
              )}
            </p>
            <input
              type="text"
              className="subirTareas-link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="Ejemplo: https://docs.google.com/..."
              disabled={loading || verificando}
            />
            <button 
              className="subirTareas-upload" 
              onClick={handleSubir}
              disabled={loading || !link.trim() || verificando}
            >
              {loading ? 'Procesando...' : verificando ? 'Verificando...' : (isUpdating ? 'Actualizar' : 'Subir')}
            </button>
          </section>
        </div>
      </div>
    </Modal>
  );
}

export default SubirTareas;