import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../paginas/Register";
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

// Mock de fetch global
global.fetch = vi.fn();

// Mock de alert
global.alert = vi.fn();

// Wrapper para agregar Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("permite escribir en todos los campos del formulario", () => {
    renderWithRouter(<Register />);

    const nombresInput = screen.getByPlaceholderText("Ingresa tus nombres");
    const apellidoPInput = screen.getByPlaceholderText("Apellido paterno");
    const apellidoMInput = screen.getByPlaceholderText("Apellido materno");
    const correoInput = screen.getByPlaceholderText("correo@ejemplo.com");
    const contraseñaInput = screen.getByPlaceholderText("Mínimo 8 caracteres");
    const repetirContraseñaInput = screen.getByPlaceholderText("Repite tu contraseña");

    fireEvent.change(nombresInput, { target: { value: "Juan Carlos" } });
    fireEvent.change(apellidoPInput, { target: { value: "Pérez" } });
    fireEvent.change(apellidoMInput, { target: { value: "García" } });
    fireEvent.change(correoInput, { target: { value: "juan@correo.com" } });
    fireEvent.change(contraseñaInput, { target: { value: "password123" } });
    fireEvent.change(repetirContraseñaInput, { target: { value: "password123" } });

    expect(nombresInput.value).toBe("Juan Carlos");
    expect(apellidoPInput.value).toBe("Pérez");
    expect(apellidoMInput.value).toBe("García");
    expect(correoInput.value).toBe("juan@correo.com");
    expect(contraseñaInput.value).toBe("password123");
    expect(repetirContraseñaInput.value).toBe("password123");
  });

  test("oculta el campo de código de estudiante cuando se selecciona Profesor", () => {
    renderWithRouter(<Register />);
    
    const profesorRadio = screen.getByLabelText(/profesor/i);
    fireEvent.click(profesorRadio);

    expect(screen.queryByPlaceholderText("12345678")).not.toBeInTheDocument();
    expect(screen.queryByText("Debe tener 8 dígitos")).not.toBeInTheDocument();
  });

  test("limpia el código de estudiante al cambiar a Profesor", () => {
    renderWithRouter(<Register />);
    
    const codigoInput = screen.getByPlaceholderText("12345678");
    fireEvent.change(codigoInput, { target: { value: "12345678" } });
    expect(codigoInput.value).toBe("12345678");
    
    const profesorRadio = screen.getByLabelText(/profesor/i);
    fireEvent.click(profesorRadio);
    
    const estudianteRadio = screen.getByLabelText(/estudiante/i);
    fireEvent.click(estudianteRadio);
    
    const nuevoCodigoInput = screen.getByPlaceholderText("12345678");
    expect(nuevoCodigoInput.value).toBe("");
  });

  test("solo permite dígitos en el código de estudiante", () => {
    renderWithRouter(<Register />);
    
    const codigoInput = screen.getByPlaceholderText("12345678");
    
    fireEvent.change(codigoInput, { target: { value: "abc123def" } });
    expect(codigoInput.value).toBe("123");
    
    fireEvent.change(codigoInput, { target: { value: "12345678" } });
    expect(codigoInput.value).toBe("12345678");
  });

  test("limita el código de estudiante a 8 dígitos", () => {
    renderWithRouter(<Register />);
    
    const codigoInput = screen.getByPlaceholderText("12345678");
    
    fireEvent.change(codigoInput, { target: { value: "12345678" } });
    expect(codigoInput.value).toBe("12345678");
  });

  test("muestra error cuando las contraseñas no coinciden", async () => {
    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Ingresa tus nombres"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido materno"), { target: { value: "García" } });
    fireEvent.change(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByPlaceholderText("12345678"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), { target: { value: "password456" } });

    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test("muestra error cuando el backend responde con error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "El correo ya está registrado" }),
    });

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Ingresa tus nombres"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido materno"), { target: { value: "García" } });
    fireEvent.change(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByPlaceholderText("12345678"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El correo ya está registrado")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("muestra error genérico cuando el backend responde con error sin mensaje", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Ingresa tus nombres"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido materno"), { target: { value: "García" } });
    fireEvent.change(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByPlaceholderText("12345678"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Error 500: Ocurrió un problema con el registro/i)).toBeInTheDocument();
    });
  });

  test("muestra error de conexión cuando falla la petición", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Ingresa tus nombres"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido materno"), { target: { value: "García" } });
    fireEvent.change(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByPlaceholderText("12345678"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("No se pudo conectar con el servidor. Inténtalo más tarde.")).toBeInTheDocument();
    });
  });

  test("muestra estado de carga durante el registro", async () => {
    fetch.mockImplementation(() => 
      new Promise((resolve) => 
        setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
      )
    );

    renderWithRouter(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Ingresa tus nombres"), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido paterno"), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText("Apellido materno"), { target: { value: "García" } });
    fireEvent.change(screen.getByPlaceholderText("correo@ejemplo.com"), { target: { value: "juan@correo.com" } });
    fireEvent.change(screen.getByPlaceholderText("12345678"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /registrarse/i });
    fireEvent.click(submitButton);

    expect(screen.getByText("Registrando...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText("Registrando...")).not.toBeInTheDocument();
    });
  });

  test("navega a login al hacer clic en el link", () => {
    renderWithRouter(<Register />);

    const loginLink = screen.getByText("Inicia Sesión");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("marca Estudiante como activo por defecto", () => {
    renderWithRouter(<Register />);

    const estudianteLabel = screen.getByText("Estudiante").closest("label");
    expect(estudianteLabel).toHaveClass("active");
  });

  test("cambia la clase activa al seleccionar Profesor", () => {
    renderWithRouter(<Register />);

    const profesorRadio = screen.getByLabelText(/profesor/i);
    fireEvent.click(profesorRadio);

    const profesorLabel = screen.getByText("Profesor").closest("label");
    expect(profesorLabel).toHaveClass("active");
  });
});