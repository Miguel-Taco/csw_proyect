import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import FormularioTarea from '../componentes/FormularioTarea';

// Mock de fetch
globalThis.fetch = vi.fn();

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('FormularioTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper para renderizar con ruta específica
  const renderWithRouter = (idSeccion = '5') => {
    return render(
      <MemoryRouter initialEntries={[`/secciones/${idSeccion}/crear-tarea`]}>
        <Routes>
          <Route path="/secciones/:idSeccion/crear-tarea" element={<FormularioTarea />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renderiza el formulario correctamente', () => {
    renderWithRouter();

    expect(screen.getByText('Crear nueva tarea')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de la tarea:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de tarea:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de vencimiento:/i)).toBeInTheDocument();
    expect(screen.getByText(/Sección ID: 5/i)).toBeInTheDocument();
  });

  test('muestra error cuando faltan campos obligatorios', async () => {
    renderWithRouter();

    const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form');
    
    // Prevenir la validación HTML5 nativa
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Por favor completa todos los campos.')).toBeInTheDocument();
    });
  });

  test('muestra error cuando no hay idSeccion', () => {
    // Renderizar sin idSeccion en la ruta
    render(
      <MemoryRouter initialEntries={['/crear-tarea']}>
        <Routes>
          <Route path="/crear-tarea" element={<FormularioTarea />} />
        </Routes>
      </MemoryRouter>
    );

    const nombreInput = screen.getByLabelText(/Nombre de la tarea:/i);
    const tipoSelect = screen.getByLabelText(/Tipo de tarea:/i);
    const descripcionTextarea = screen.getByLabelText(/Descripción:/i);
    const fechaInput = screen.getByLabelText(/Fecha de vencimiento:/i);

    fireEvent.change(nombreInput, { target: { value: 'Tarea Test' } });
    fireEvent.change(tipoSelect, { target: { value: 'Individual' } });
    fireEvent.change(descripcionTextarea, { target: { value: 'Descripción test' } });
    fireEvent.change(fechaInput, { target: { value: '2025-12-31' } });

    const botonCrear = screen.getByRole('button', { name: /Crear Tarea/i });
    fireEvent.click(botonCrear);

    // El error debe aparecer porque no hay idSeccion
    expect(screen.getByText(/No se pudo identificar la sección/i)).toBeInTheDocument();
  });

  test('muestra error cuando el servidor responde con error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderWithRouter();

    // Llenar el formulario
    const nombreInput = screen.getByLabelText(/Nombre de la tarea:/i);
    const tipoSelect = screen.getByLabelText(/Tipo de tarea:/i);
    const descripcionTextarea = screen.getByLabelText(/Descripción:/i);
    const fechaInput = screen.getByLabelText(/Fecha de vencimiento:/i);

    fireEvent.change(nombreInput, { target: { value: 'Tarea Test' } });
    fireEvent.change(tipoSelect, { target: { value: 'Individual' } });
    fireEvent.change(descripcionTextarea, { target: { value: 'Descripción test' } });
    fireEvent.change(fechaInput, { target: { value: '2025-12-31' } });

    const botonCrear = screen.getByRole('button', { name: /Crear Tarea/i });
    fireEvent.click(botonCrear);

    await waitFor(() => {
      expect(screen.getByText('No se pudo crear la tarea. Inténtalo nuevamente.')).toBeInTheDocument();
    });
  });

  test('limpia el error cuando el usuario escribe', async () => {
    renderWithRouter();

    const form = screen.getByRole('button', { name: /Crear Tarea/i }).closest('form');
    
    // Crear un evento submit personalizado que no active la validación HTML5
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'target', { value: form, enumerable: true });
    
    // Disparar el evento submit manualmente
    form.dispatchEvent(submitEvent);

    // Debe mostrar error
    await waitFor(() => {
      expect(screen.getByText('Por favor completa todos los campos.')).toBeInTheDocument();
    });

    // Escribir en algún campo debe limpiar el error
    const nombreInput = screen.getByLabelText(/Nombre de la tarea:/i);
    fireEvent.change(nombreInput, { target: { value: 'Algo' } });

    expect(screen.queryByText('Por favor completa todos los campos.')).not.toBeInTheDocument();
  });

  test('valida formato de fecha', () => {
    renderWithRouter();

    const fechaInput = screen.getByLabelText(/Fecha de vencimiento:/i);
    
    // El input debe tener type="date"
    expect(fechaInput).toHaveAttribute('type', 'date');
  });

  test('muestra el idSeccion correcto en diferentes rutas', () => {
    const { unmount } = renderWithRouter('123');
    expect(screen.getByText(/Sección ID: 123/i)).toBeInTheDocument();
    
    unmount();
    
    renderWithRouter('456');
    expect(screen.getByText(/Sección ID: 456/i)).toBeInTheDocument();
  });

  test('maneja errores de red correctamente', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter();

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/Nombre de la tarea:/i), { 
      target: { value: 'Test' } 
    });
    fireEvent.change(screen.getByLabelText(/Tipo de tarea:/i), { 
      target: { value: 'Individual' } 
    });
    fireEvent.change(screen.getByLabelText(/Descripción:/i), { 
      target: { value: 'Test' } 
    });
    fireEvent.change(screen.getByLabelText(/Fecha de vencimiento:/i), { 
      target: { value: '2025-12-31' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear Tarea/i }));

    await waitFor(() => {
      expect(screen.getByText('No se pudo crear la tarea. Inténtalo nuevamente.')).toBeInTheDocument();
    });
  });
});