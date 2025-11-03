import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CrearSeccionModal from "../componentes/CrearSeccionModal";
import { vi, describe, test, expect, beforeEach } from "vitest";

vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (node) => node,
  };
});

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

describe("CrearSeccionModal", () => {
  const mockOnClose = vi.fn();
  const mockOnCrear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza correctamente cuando está abierto", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    expect(screen.getByText("Crear Nueva Sección")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1")).toBeInTheDocument();
  });

  test("muestra el año actual correctamente", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    expect(screen.getByText("Año: 2025")).toBeInTheDocument();
  });

  test("permite escribir en el input de nombre", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "Matemáticas 101" } });

    expect(input.value).toBe("Matemáticas 101");
  });

  test("muestra error si se intenta crear sección sin nombre", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const btnCrear = screen.getByText("Crear Sección");
    fireEvent.click(btnCrear);

    expect(screen.getByText("El nombre de la sección es obligatorio")).toBeInTheDocument();
    expect(mockOnCrear).not.toHaveBeenCalled();
  });

  test("muestra error si el nombre tiene menos de 3 caracteres", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "AB" } });

    const btnCrear = screen.getByText("Crear Sección");
    fireEvent.click(btnCrear);

    expect(screen.getByText("El nombre debe tener al menos 3 caracteres")).toBeInTheDocument();
    expect(mockOnCrear).not.toHaveBeenCalled();
  });

  test("limpia el error al escribir en el input", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const btnCrear = screen.getByText("Crear Sección");
    fireEvent.click(btnCrear);

    expect(screen.getByText("El nombre de la sección es obligatorio")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "A" } });

    expect(
      screen.queryByText("El nombre de la sección es obligatorio")
    ).not.toBeInTheDocument();
  });

  test("llama a onCrear con el nombre correcto al enviar", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "  Física Cuántica  " } });

    const btnCrear = screen.getByText("Crear Sección");
    fireEvent.click(btnCrear);

    expect(mockOnCrear).toHaveBeenCalledWith("Física Cuántica");
  });

  test("cierra el modal al hacer clic en Cancelar", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const btnCancelar = screen.getByText("Cancelar");
    fireEvent.click(btnCancelar);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("cierra el modal al hacer clic en el botón X", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const btnCerrar = screen.getByLabelText("Cerrar");
    fireEvent.click(btnCerrar);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("limpia el input al abrir el modal", async () => {
    const { rerender } = render(
      <CrearSeccionModal
        open={false}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    rerender(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
      expect(input.value).toBe("");
    });
  });

  test("respeta el límite de 40 caracteres", () => {
    render(
      <CrearSeccionModal
        open={true}
        onClose={mockOnClose}
        onCrear={mockOnCrear}
        anioActual={2025}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    expect(input).toHaveAttribute("maxLength", "40");
  });
});