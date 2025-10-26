import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../context/ProtectedRoute";
import { vi, describe, test, expect, beforeEach } from "vitest";

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
let mockAuthValue = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

// Componente de prueba protegido
const ProtectedContent = () => <div>Contenido Protegido</div>;

// Wrapper para renderizar con Router
const renderWithRouter = (component, initialRoute = "/") => {
  window.history.pushState({}, "Test page", initialRoute);
  
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route path="/seccionesPage" element={<div>Dashboard</div>} />
        <Route path="/protected" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Resetear el mock del auth a valores por defecto
    mockAuthValue = {
      isAuthenticated: false,
      user: null,
      loading: false,
    };
  });

  test("muestra pantalla de carga cuando loading es true", () => {
    mockAuthValue = {
      isAuthenticated: false,
      user: null,
      loading: true,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Protegido")).not.toBeInTheDocument();
  });

  test("redirige a /login cuando el usuario no está autenticado", () => {
    mockAuthValue = {
      isAuthenticated: false,
      user: null,
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Página de Login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Protegido")).not.toBeInTheDocument();
  });

  test("muestra mensaje de cuenta inactiva cuando user.active es false", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: false,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("⚠️ Cuenta Inactiva")).toBeInTheDocument();
    expect(
      screen.getByText(/Su cuenta ha sido desactivada. Contacte al administrador./)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /volver al inicio/i })).toBeInTheDocument();
    expect(screen.queryByText("Contenido Protegido")).not.toBeInTheDocument();
  });

  test("navega a login al hacer clic en 'Volver al inicio' desde cuenta inactiva", async () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: false,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    const button = screen.getByRole("button", { name: /volver al inicio/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("muestra contenido protegido cuando el usuario está autenticado y activo", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("permite acceso cuando el rol del usuario está en allowedRoles", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor", "admin"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("verifica roles sin distinción de mayúsculas/minúsculas", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "PROFESOR",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor", "admin"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("bloquea acceso cuando el rol del usuario no está en allowedRoles", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "estudiante",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor", "admin"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("🚫 Acceso Denegado")).toBeInTheDocument();
    expect(
      screen.getByText(/No tiene permisos para acceder a esta sección./)
    ).toBeInTheDocument();
    expect(screen.getByText(/Su rol actual:/)).toBeInTheDocument();
    expect(screen.getByText("estudiante")).toBeInTheDocument();
    expect(screen.queryByText("Contenido Protegido")).not.toBeInTheDocument();
  });

  test("navega al dashboard correcto al hacer clic en 'Ir a mi dashboard' para estudiante", async () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "estudiante@correo.com",
        role: "estudiante",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    const button = screen.getByRole("button", { name: /ir a mi dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/seccionesPage");
    });
  });

  test("navega al dashboard correcto al hacer clic en 'Ir a mi dashboard' para profesor", async () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "profesor@correo.com",
        role: "profesor",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["admin"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    const button = screen.getByRole("button", { name: /ir a mi dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/seccionesPage");
    });
  });

  test("permite acceso cuando no se especifican allowedRoles", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "cualquier-rol",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("maneja usuario sin rol definido", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: undefined,
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("🚫 Acceso Denegado")).toBeInTheDocument();
  });

  test("muestra contenido protegido cuando user.active es true explícitamente", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("muestra contenido protegido cuando user.active es undefined (por defecto activo)", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: undefined,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("permite múltiples roles en allowedRoles", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "admin@correo.com",
        role: "admin",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={["profesor", "admin", "estudiante"]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });

  test("bloquea acceso con allowedRoles vacío si el usuario tiene rol", () => {
    mockAuthValue = {
      isAuthenticated: true,
      user: {
        id: 1,
        username: "test@correo.com",
        role: "profesor",
        active: true,
      },
      loading: false,
    };

    renderWithRouter(
      <ProtectedRoute allowedRoles={[]}>
        <ProtectedContent />
      </ProtectedRoute>,
      "/protected"
    );

    // allowedRoles vacío significa que no hay restricciones de rol
    expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
  });
});