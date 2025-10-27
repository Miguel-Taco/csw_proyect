import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AlumnoPage from "../paginas/AlumnoPage";
import { vi, beforeEach, describe, test, expect, afterEach } from "vitest";

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
const mockUser = {
  id: 1,
  nombres: "Juan",
  apellidoP: "Pérez",
  role: "alumno"
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

// Mock del componente SeccionAlumnoCard
vi.mock("../componentes/SeccionAlumnoCard", () => ({
  default: ({ seccion }) => (
    <div data-testid={`seccion-card-${seccion.idSeccion}`}>
      {seccion.nombreCurso}
    </div>
  ),
}));

// Mock del componente InvitacionesPendientesButton
vi.mock("../componentes/InvitacionesPendientesButton", () => ({
  default: () => <button data-testid="invitaciones-button">Invitaciones</button>,
}));

// Mock de fetch
global.fetch = vi.fn();

// Mock de window.confirm
global.confirm = vi.fn();

// Wrapper para agregar Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AlumnoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
    global.confirm.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza el ícono de usuario", () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    const icon = document.querySelector('.fa-user');
    expect(icon).toBeInTheDocument();
  });

  test("renderiza el selector de año con el valor por defecto 2026", () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("2026");
  });

  test("renderiza todas las opciones de año", () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    expect(screen.getByRole('option', { name: '2024' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2025' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2027' })).toBeInTheDocument();
  });

  test("renderiza el botón de invitaciones pendientes", () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    expect(screen.getByTestId("invitaciones-button")).toBeInTheDocument();
  });

  test("renderiza el botón de cerrar sesión", () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('title', 'Cerrar sesión');
  });

  test("obtiene el id del alumno al cargar el componente", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/alumno/alumno-id/1",
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      );
    });
  });

  test("muestra mensaje cuando no hay secciones", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no estás inscrito en ninguna sección/i)).toBeInTheDocument();
    });
  });

  test("muestra error cuando falla la obtención del id del alumno", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    renderWithRouter(<AlumnoPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Usuario no es un alumno")).toBeInTheDocument();
    });
  });

  test("no cierra sesión cuando el usuario cancela", async () => {
    global.confirm.mockReturnValue(false);
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutButton);

    expect(global.confirm).toHaveBeenCalledWith("¿Está seguro que desea cerrar sesión?");
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("habilita los controles después de cargar", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      
      expect(select).not.toBeDisabled();
      expect(logoutButton).not.toBeDisabled();
    });
  });

  test("muestra 'USUARIO' cuando no hay nombre disponible", () => {
    vi.mock("../context/AuthContext", () => ({
      useAuth: () => ({
        user: { id: 1 },
        logout: mockLogout,
      }),
    }));

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, idAlumno: 10 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<AlumnoPage />);
    
    expect(screen.getByText(/SALUDOS, USUARIO/)).toBeInTheDocument();
  });

});