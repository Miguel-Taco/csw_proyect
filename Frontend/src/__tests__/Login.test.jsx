import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../paginas/Login";
import { vi, beforeEach } from "vitest";

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
const mockLogin = vi.fn();
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock de fetch global para evitar llamadas reales al backend
global.fetch = vi.fn();

// Wrapper para agregar Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Login", () => {
  // Limpiar mocks antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza el formulario de login", () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("permite escribir en los campos de correo y contraseña", () => {
    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });

    expect(correoInput.value).toBe("test@correo.com");
    expect(contraseñaInput.value).toBe("password123");
  });

  test("alterna la visibilidad de la contraseña al hacer clic en el ícono", () => {
    renderWithRouter(<Login />);

    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const toggleIcon = screen.getByTitle("Mostrar contraseña");

    expect(contraseñaInput.type).toBe("password");

    fireEvent.click(toggleIcon);
    expect(contraseñaInput.type).toBe("text");

    fireEvent.click(toggleIcon);
    expect(contraseñaInput.type).toBe("password");
  });

  test("muestra error cuando se envía el formulario sin completar campos", async () => {
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor complete todos los campos")).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("envía el formulario y navega cuando el login es exitoso", async () => {
    // Mockear la respuesta exitosa del login
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { 
        id: 1, 
        username: "test@correo.com",
        nombres: "Test",
        apellidoP: "User",
        role: "profesor" 
      },
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { username: "test@correo.com", password: "password123" },
        "profesor"
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/seccionesPage");
    });
  });

  test("muestra mensaje de error cuando las credenciales son inválidas", async () => {
    // Mockear respuesta de error
    mockLogin.mockResolvedValueOnce({
      success: false,
      message: "Credenciales inválidas",
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "wrong@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("muestra estado de carga durante el proceso de login", async () => {
    // Simular un delay en el login
    mockLogin.mockImplementation(() => 
      new Promise((resolve) => 
        setTimeout(() => resolve({ success: true, user: {} }), 100)
      )
    );

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Verificar estado de carga inmediatamente
    expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(correoInput).toBeDisabled();
    expect(contraseñaInput).toBeDisabled();
  });

  test("limpia el mensaje de error al escribir en los campos", async () => {
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor complete todos los campos")).toBeInTheDocument();
    });

    const correoInput = screen.getByPlaceholderText("Correo");
    fireEvent.change(correoInput, { target: { value: "t" } });

    expect(screen.queryByText("Por favor complete todos los campos")).not.toBeInTheDocument();
  });

  test("navega al hacer clic en el link de registro", () => {
    renderWithRouter(<Login />);

    const registerLink = screen.getByText(/¿No tiene cuenta\? Regístrese aquí!/i);
    expect(registerLink).toHaveAttribute("href", "/register");
  });
});