import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TareasAlumno from '../paginas/TareasAlumno';

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de fetch
global.fetch = vi.fn();

describe("TareasAlumno", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (idSeccion = "1") => {
    return render(
      <MemoryRouter initialEntries={[`/alumno/seccion/${idSeccion}/tareas`]}>
        <Routes>
          <Route path="/alumno/seccion/:idSeccion/tareas" element={<TareasAlumno />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("renderiza el encabezado correctamente", () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: [] }),
    });

    renderWithRouter();

    expect(screen.getByRole("button", { name: /← volver/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tareas de la sección/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver grupo de trabajo/i })).toBeInTheDocument();
  });

  test("muestra estado de carga inicial", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Promise que nunca se resuelve

    renderWithRouter();

    expect(screen.getByText(/cargando tareas/i)).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay tareas", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: [] }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/no hay tareas disponibles para esta sección/i)).toBeInTheDocument();
    });
  });

  test("carga y muestra la lista de tareas correctamente", async () => {
    const tareasMock = [
      {
        idTarea: 1,
        nombre: "Tarea 1",
        descripcion: "Descripción de la tarea 1",
        tipo: "Individual",
        fechaCreacion: "2025-10-25T17:03:58",
        fechaVencimiento: "2025-11-11T00:00:00",
      },
      {
        idTarea: 2,
        nombre: "Tarea 2",
        descripcion: "Descripción de la tarea 2",
        tipo: "Grupal",
        fechaCreacion: "2025-10-26T10:00:00",
        fechaVencimiento: "2025-11-15T23:59:59",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: tareasMock }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
      expect(screen.getByText("Tarea 2")).toBeInTheDocument();
      expect(screen.getByText(/descripción de la tarea 1/i)).toBeInTheDocument();
      expect(screen.getByText(/tipo de tarea: individual/i)).toBeInTheDocument();
    });
  });

  test("formatea las fechas correctamente", async () => {
    const tareasMock = [
      {
        idTarea: 1,
        nombre: "Tarea 1",
        descripcion: "Descripción",
        tipo: "Individual",
        fechaCreacion: "2025-10-25T17:03:58",
        fechaVencimiento: "2025-11-11T00:00:00",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: tareasMock }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/fecha creación: 25\/10\/2025 17:03/i)).toBeInTheDocument();
      expect(screen.getByText(/fecha vencimiento: 11\/11\/2025 00:00/i)).toBeInTheDocument();
    });
  });

  test("muestra error cuando falla la petición", async () => {
    fetch.mockRejectedValueOnce(new Error("Error de conexión"));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/error de conexión con el servidor/i)).toBeInTheDocument();
    });
  });

  test("muestra error cuando el backend responde con error", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, message: "Error al cargar tareas" }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/error al cargar tareas/i)).toBeInTheDocument();
    });
  });

  test("ejecuta console.log con el idTarea al hacer clic en 'Subir Entrega'", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    
    const tareasMock = [
      {
        idTarea: 123,
        nombre: "Tarea Test",
        descripcion: "Descripción test",
        tipo: "Individual",
        fechaCreacion: "2025-10-25T17:03:58",
        fechaVencimiento: "2025-11-11T00:00:00",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: tareasMock }),
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Tarea Test")).toBeInTheDocument();
    });

    const botonSubir = screen.getByRole("button", { name: /subir entrega/i });
    fireEvent.click(botonSubir);

    expect(consoleSpy).toHaveBeenCalledWith(123);
    
    consoleSpy.mockRestore();
  });

  test("renderiza múltiples botones 'Subir Entrega' para cada tarea", async () => {
    const tareasMock = [
      {
        idTarea: 1,
        nombre: "Tarea 1",
        descripcion: "Desc 1",
        tipo: "Individual",
        fechaCreacion: "2025-10-25T17:03:58",
        fechaVencimiento: "2025-11-11T00:00:00",
      },
      {
        idTarea: 2,
        nombre: "Tarea 2",
        descripcion: "Desc 2",
        tipo: "Grupal",
        fechaCreacion: "2025-10-25T17:03:58",
        fechaVencimiento: "2025-11-11T00:00:00",
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: tareasMock }),
    });

    renderWithRouter();

    await waitFor(() => {
      const botonesSubir = screen.getAllByRole("button", { name: /subir entrega/i });
      expect(botonesSubir).toHaveLength(2);
    });
  });

  test("usa el idSeccion correcto en la petición fetch", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, tareas: [] }),
    });

    renderWithRouter("42");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/tareas/seccion/42",
        expect.objectContaining({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });
  });
});