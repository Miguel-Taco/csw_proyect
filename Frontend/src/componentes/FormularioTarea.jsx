import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/FormularioTarea.css";

export default function FormularioTarea() {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const { idSeccion } = useParams();

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nombre || !tipo || !descripcion || !fecha) {
      setError("Por favor completa todos los campos.");
      return;
    }

    // ✅ Validar que exista idSeccion
    if (!idSeccion) {
      setError("No se pudo identificar la sección.");
      return;
    }

    const nuevaTarea = {
      idSeccion: Number(idSeccion),
      nombre,
      tipo,
      descripcion,
      fechaVencimiento: fecha + "T00:00:00",
    };

    try {
      const respuesta = await fetch("http://localhost:8080/api/tareas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaTarea),
      });

      if (!respuesta.ok) {
        throw new Error("Error al crear la tarea");
      }

      const data = await respuesta.json();
      console.log("✅ Tarea creada:", data);

      // ✅ Redirigir de vuelta a las tareas de esta sección
      navigate(`/secciones/${idSeccion}/tareas`);
    } catch (error) {
      console.error("❌ Error:", error);
      setError("No se pudo crear la tarea. Inténtalo nuevamente.");
    }
  };

  return (
    <form className="formulario-tarea" onSubmit={manejarEnvio}>
      <h2>Crear nueva tarea</h2>
      
      {/* ✅ Mostrar la sección actual */}
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '10px' }}>
        Sección ID: {idSeccion}
      </p>

      {error && <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>}

      <div className="campo">
        <label htmlFor="nombre-tarea">Nombre de la tarea:</label>
        <input
          id="nombre-tarea"
          type="text"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setError("");
          }}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="tipo-tarea">Tipo de tarea:</label>
        <select
          id="tipo-tarea"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setError("");
          }}
          required
        >
          <option value="">Seleccionar tipo...</option>
          <option value="Individual">Individual</option>
          <option value="Grupal">Grupal</option>
        </select>
      </div>

      <div className="campo">
        <label htmlFor="descripcion-tarea">Descripción:</label>
        <textarea
          id="descripcion-tarea"
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            setError("");
          }}
          rows="4"
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="fecha-tarea">Fecha de vencimiento:</label>
        <input
          id="fecha-tarea"
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            setError("");
          }}
          required
        />
      </div>

      <button type="submit" className="boton-crear">
        Crear Tarea
      </button>
    </form>
  );
}