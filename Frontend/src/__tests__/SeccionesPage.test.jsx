import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SeccionesPage from "../paginas/SeccionesPage";
import { vi, describe, test, expect, beforeEach } from "vitest";

beforeAll(() => {
  if (!window.HTMLDialogElement) {
    window.HTMLDialogElement = class extends HTMLElement {};
  }
  window.HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.open = true;
  });
  window.HTMLDialogElement.prototype.close = vi.fn(function () {
    this.open = false;
  });
});

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock del AuthContext
const mockLogout = vi.fn();
let mockAuthValue = {
  user: {
    id: 1,
    nombres: "Juan",
    role: "profesor",
  },
  logout: mockLogout,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

// Mock de fetch global
global.fetch = vi.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SeccionesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthValue = {
      user: {
        id: 1,
        nombres: "Juan",
        role: "profesor",
      },
      logout: mockLogout,
    };
  });

  test("renderiza el componente correctamente", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText(/SALUDOS, JUAN/i)).toBeInTheDocument();
    });
  });

  test("muestra el nombre del usuario en mayúsculas", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("SALUDOS, JUAN")).toBeInTheDocument();
    });
  });

  test("carga secciones al montar el componente", async () => {
    const mockSecciones = [
      { idSeccion: 1, nombreCurso: "Matemáticas", anio: 2025, codigo: 1234 },
      { idSeccion: 2, nombreCurso: "Física", anio: 2025, codigo: 5678 },
    ];

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSecciones,
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Matemáticas")).toBeInTheDocument();
      expect(screen.getByText("Física")).toBeInTheDocument();
    });
  });

  test("permite cambiar el año seleccionado", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const selectAnio = screen.getByRole("combobox");
    fireEvent.change(selectAnio, { target: { value: "2024" } });

    expect(selectAnio.value).toBe("2024");
  });

  test("abre modal de crear sección al hacer clic en el botón", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Agregar nueva sección")).toBeInTheDocument();
    });

    const btnAgregar = screen.getByText("Agregar nueva sección");
    fireEvent.click(btnAgregar);

    await waitFor(() => {
      expect(screen.getByText("Crear Nueva Sección")).toBeInTheDocument();
    });
  });

  test("muestra mensaje cuando no hay secciones", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("No hay secciones para este año")).toBeInTheDocument();
    });
  });

  test("maneja el logout correctamente", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    global.confirm = vi.fn(() => true);

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    });

    const btnLogout = screen.getByText("Cerrar Sesión");
    fireEvent.click(btnLogout);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("cancela el logout si el usuario no confirma", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    global.confirm = vi.fn(() => false);

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    });

    const btnLogout = screen.getByText("Cerrar Sesión");
    fireEvent.click(btnLogout);

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("maneja error al obtener id_profesor", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: "Error" }),
    });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Usuario no es profesor")).toBeInTheDocument();
    });
  });

  test("maneja error al cargar secciones", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar las secciones")).toBeInTheDocument();
    });
  });

  test("deshabilita botones durante la carga", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idProfesor: 1 }),
      })
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => [],
                }),
              100
            )
          )
      );

    renderWithRouter(<SeccionesPage />);

    await waitFor(() => {
      const btnAgregar = screen.getByText(/Agregar nueva sección|Cargando.../i);
      expect(btnAgregar).toBeDisabled();
    });
  });
});