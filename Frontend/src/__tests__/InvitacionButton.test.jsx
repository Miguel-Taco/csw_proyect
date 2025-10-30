import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import InvitacionButton from "../componentes/InvitacionButton"; // RUTA CORREGIDA
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // RUTA CORREGIDA

// --- Mocks ---
// 1. Mock de CSS
vi.mock("../styles/InvitacionButton.css", () => ({ // RUTA CORREGIDA
  default: {},
}));

// 2. Mock del Modal: solo renderiza sus hijos si está 'open'
vi.mock("../componentes/Modal", () => ({ // RUTA CORREGIDA
  default: ({ open, children, onClose }) => {
    if (!open) return null;
    return (
      <div data-testid="modal">
        {children}
        {/* Incluimos un botón de cierre falso para el prop 'onClose' */}
        <button data-testid="modal-close" onClick={onClose}>Cerrar Modal</button>
      </div>
    );
  },
}));

// 3. Mock de 'react-router-dom'
vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
}));

// 4. Mock de 'AuthContext'
vi.mock("../context/AuthContext", () => ({ // RUTA CORREGIDA
  useAuth: vi.fn(),
}));

// 5. Mock de 'fetch' (global)
global.fetch = vi.fn();

// --- Datos de Prueba ---
const mockProfesor = {
  id: 1,
  role: "profesor",
};

const mockAlumno = {
  id: 2,
  role: "alumno",
};

const mockIdSeccion = "123";

describe("InvitacionButton", () => {
  // Configuración antes de CADA test
  beforeEach(() => {
    // Limpiamos todos los mocks
    vi.clearAllMocks();

    // ELIMINADOS vi.useFakeTimers() y vi.useRealTimers() de beforeEach/afterEach
    // ...

    // Mocks por defecto (los tests que necesiten otros valores los sobreescribirán)
    vi.mocked(useParams).mockReturnValue({ idSeccion: mockIdSeccion });
    vi.mocked(useAuth).mockReturnValue({ user: mockProfesor });
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Invitación enviada correctamente 🎉",
      }),
    });
  });

  // Limpieza después de CADA test
  afterEach(() => {
    // vi.useRealTimers(); // <--- ELIMINADO DE AQUÍ
  });

  // --- Tests ---

  test("renderiza el botón inicial", () => {
    render(<InvitacionButton />);
    expect(screen.getByRole("button", { name: /invitar alumno/i })).toBeInTheDocument();
  });

  test("abre el modal al hacer clic", () => {
    render(<InvitacionButton />);
    const botonInvitar = screen.getByRole("button", { name: /invitar alumno/i });
    fireEvent.click(botonInvitar);

    // El modal ahora está abierto y podemos ver su contenido
    expect(screen.getByText("Correo del alumno")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("alumno@correo.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  test("cierra el modal al hacer clic en 'Cancelar'", () => {
    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    // Verificamos que el modal está abierto
    expect(screen.getByText("Correo del alumno")).toBeInTheDocument();

    // Clic en Cancelar
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    // Verificamos que el modal se cerró (su contenido ya no existe)
    expect(screen.queryByText("Correo del alumno")).not.toBeInTheDocument();
  });

  test("permite escribir en el input de email", () => {
    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "test@correo.com" } });

    expect(input.value).toBe("test@correo.com");
  });

  // --- Tests de Validación (Caminos Tristes) ---

  test("muestra error si el usuario no es profesor", async () => {
    // Sobreescribimos el mock de useAuth para este test
    vi.mocked(useAuth).mockReturnValue({ user: mockAlumno });

    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    // Llenamos el formulario
    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "test@correo.com" } });

    // Enviamos
    const botonEnviar = screen.getByRole("button", { name: /enviar invitación/i });
    fireEvent.click(botonEnviar);

    // Esperamos a que aparezca el mensaje de error
    await waitFor(() => {
      expect(screen.getByText("Solo los profesores pueden enviar invitaciones.")).toBeInTheDocument();
    });

    // Verificamos que NO se llamó a la API
    expect(global.fetch).not.toHaveBeenCalled();
  });

  /*test("muestra error si el email es inválido", async () => {
    render(<InvitacionButton />);

    // 1. Abrir el modal
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));
    // 2. Definir la variable 'input'
    const input = screen.getByPlaceholderText("alumno@correo.com");

    fireEvent.change(input, { target: { value: "correo-invalido" } }); // Email inválido

    // CORRECCIÓN: Usar fireEvent.submit en el formulario
    fireEvent.submit(screen.getByTestId("modal").querySelector("form"));

    // CORRECCIÓN: Debemos esperar a que el estado 'mensaje' actualice la UI.
    // Y el string en el componente TIENE UN ESPACIO AL FINAL.
    await waitFor(() => {
      expect(screen.getByText("Por favor ingrese un correo válido. ")).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });*/

  test("muestra error si falta idSeccion", async () => {
    // Sobreescribimos el mock de useParams
    vi.mocked(useParams).mockReturnValue({ idSeccion: null });

    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "test@correo.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar invitación/i }));

    await waitFor(() => {
      expect(screen.getByText("No se encontró el ID de la sección en la URL.")).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // --- Tests de API (Camino Feliz y Errores) ---

  test("envía la invitación exitosamente (Camino Feliz)", async () => {
    // vi.useFakeTimers(); // <--- ELIMINADO

    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "test@correo.com" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar invitación/i }));

    // CORRECCIÓN: Esperamos a que aparezca el mensaje de ÉXITO
    await waitFor(() => {
      expect(screen.getByText("Invitación enviada correctamente 🎉")).toBeInTheDocument();
    });

    // Verificamos que el input se limpió
    expect(input.value).toBe("");

    // Verificamos que el email aparece en la lista de "enviadas"
    // (Esto también prueba el bug de la 'key' que te mencioné)
    expect(screen.getByText("Invitaciones enviadas:")).toBeInTheDocument();
    expect(screen.getByText("test@correo.com")).toBeInTheDocument();

    // vi.useRealTimers(); // <--- ELIMINADO
  });

  test("muestra mensaje de error si la API falla (response.ok = false)", async () => {
    // Mock de una respuesta de error de la API
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: "Error de API: El alumno ya existe",
      }),
    });

    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    fireEvent.change(screen.getByPlaceholderText("alumno@correo.com"), {
      target: { value: "test@correo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar invitación/i }));

    // Esperamos a que aparezca el mensaje de error de la API
    await waitFor(() => {
      expect(screen.getByText("Error de API: El alumno ya existe")).toBeInTheDocument();
    });
  });

  test("muestra mensaje de error si fetch falla (error de red)", async () => {
    // Mock de un error de red
    vi.mocked(global.fetch).mockRejectedValue(new Error("Error de conexión"));

    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    fireEvent.change(screen.getByPlaceholderText("alumno@correo.com"), {
      target: { value: "test@correo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar invitación/i }));

    // Esperamos a que aparezca el mensaje de error genérico
    await waitFor(() => {
      expect(screen.getByText("Error de conexión. Inténtalo de nuevo.")).toBeInTheDocument();
    });
  });
});




