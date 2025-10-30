import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../paginas/Login";
import { vi, beforeEach, describe, test, expect } from "vitest";

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

// Wrapper para agregar Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Login", () => {
  // Limpiar mocks antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza el formulario de login con todos los elementos", () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/¿No tiene cuenta\? Regístrese aquí!/i)).toBeInTheDocument();
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
    expect(screen.getByTitle("Ocultar contraseña")).toBeInTheDocument();

    fireEvent.click(toggleIcon);
    expect(contraseñaInput.type).toBe("password");
    expect(screen.getByTitle("Mostrar contraseña")).toBeInTheDocument();
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

  test("muestra error cuando solo falta el correo", async () => {
    renderWithRouter(<Login />);

    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor complete todos los campos")).toBeInTheDocument();
    });
  });

  test("muestra error cuando solo falta la contraseña", async () => {
    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor complete todos los campos")).toBeInTheDocument();
    });
  });

  test("envía el formulario y navega a AlumnoPage cuando el usuario es alumno", async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { 
        id: 1, 
        username: "alumno1",
        nombres: "Alumno",
        apellidoP: "Test",
        role: "alumno" 
      },
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "alumno1" } });
    fireEvent.change(contraseñaInput, { target: { value: "alumno1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "alumno1",
        password: "alumno1"
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/AlumnoPage");
    });
  });

  test("envía el formulario y navega a AlumnoPage cuando el usuario es estudiante", async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { 
        id: 2, 
        username: "estudiante@test.com",
        nombres: "Estudiante",
        apellidoP: "Test",
        role: "estudiante" 
      },
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "estudiante@test.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/AlumnoPage");
    });
  });

  test("envía el formulario y navega a seccionesPage cuando el usuario es profesor", async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { 
        id: 1, 
        username: "profe1",
        nombres: "Profesor",
        apellidoP: "Test",
        role: "profesor" 
      },
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "profe1" } });
    fireEvent.change(contraseñaInput, { target: { value: "profe1" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "profe1",
        password: "profe1"
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/seccionesPage");
    });
  });

  test("muestra mensaje de error cuando las credenciales son inválidas", async () => {
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

  test("muestra mensaje de error genérico cuando el login falla sin mensaje", async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
    });

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });
  });

  test("muestra error de conexión cuando hay una excepción", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Error de conexión con el servidor")).toBeInTheDocument();
    });
  });

  test("muestra estado de carga durante el proceso de login", async () => {
    mockLogin.mockImplementation(() => 
      new Promise((resolve) => 
        setTimeout(() => resolve({ 
          success: true, 
          user: { role: "profesor" } 
        }), 100)
      )
    );

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Verificar estado de carga
    expect(screen.getByText("Iniciando sesión...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(correoInput).toBeDisabled();
    expect(contraseñaInput).toBeDisabled();

    // Esperar a que termine
    await waitFor(() => {
      expect(screen.queryByText("Iniciando sesión...")).not.toBeInTheDocument();
    });
  });

  test("limpia el mensaje de error al escribir en el campo de correo", async () => {
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

  test("limpia el mensaje de error al escribir en el campo de contraseña", async () => {
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Por favor complete todos los campos")).toBeInTheDocument();
    });

    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    fireEvent.change(contraseñaInput, { target: { value: "p" } });

    expect(screen.queryByText("Por favor complete todos los campos")).not.toBeInTheDocument();
  });

  test("navega a la página de registro al hacer clic en el link", () => {
    renderWithRouter(<Login />);

    const registerLink = screen.getByText(/¿No tiene cuenta\? Regístrese aquí!/i);
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("renderiza la información de credenciales de prueba", () => {
    renderWithRouter(<Login />);

    expect(screen.getByText(/correo y contraseña del profe: profe1/i)).toBeInTheDocument();
    expect(screen.getByText(/correo y contraseña del alumno: alumno1/i)).toBeInTheDocument();
  });

  test("deshabilita el botón durante la carga", async () => {
    mockLogin.mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ success: true, user: { role: "profesor" } }), 100))
    );

    renderWithRouter(<Login />);

    const correoInput = screen.getByPlaceholderText("Correo");
    const contraseñaInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(correoInput, { target: { value: "test@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    
    expect(submitButton).not.toBeDisabled();
    
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});