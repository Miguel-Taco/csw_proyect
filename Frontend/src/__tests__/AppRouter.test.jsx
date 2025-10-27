import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AppRouter from "../paginas/AppRouter";

// 🧩 Estado simulado del contexto de autenticación
const mockAuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  hasRole: vi.fn(),
  updateUser: vi.fn(),
};

// 🪄 Mock del hook useAuth
vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

describe("AppRouter - Rutas básicas", () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = false;
    mockAuthState.user = null;
    mockAuthState.loading = false;
    window.history.pushState({}, "", "/"); // reset a ruta raíz
  });

  test("muestra página de Register", () => {
    window.history.pushState({}, "", "/register");
    render(<AppRouter />);
    expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
  });

  test("muestra 'Cargando...' cuando loading = true", () => {
    mockAuthState.loading = true;
    render(<AppRouter />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  test("redirige a seccionesPage cuando usuario es profesor", () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { role: "profesor" };
    window.history.pushState({}, "", "/");
    render(<AppRouter />);
    expect(screen.getByText(/secciones/i)).toBeInTheDocument();
  });

  test("redirige a alumnosPage cuando usuario es alumno", () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { role: "alumno" };
    window.history.pushState({}, "", "/");
    render(<AppRouter />);
    expect(screen.getByText(/ver invitaciones pendientes/i)).toBeInTheDocument();
  });

  test("muestra página de Secciones si rol = profesor y ruta /seccionesPage", () => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = { role: "profesor" };
    window.history.pushState({}, "", "/seccionesPage");
    render(<AppRouter />);
    expect(screen.getByText(/secciones/i)).toBeInTheDocument();
  });

  test("redirige ruta desconocida al inicio (no autenticado → login)", () => {
    window.history.pushState({}, "", "/rutaInexistente");
    render(<AppRouter />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
