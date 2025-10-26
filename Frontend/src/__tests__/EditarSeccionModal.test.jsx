import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditarSeccionModal from "../componentes/EditarSeccionModal";
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

describe("EditarSeccionModal", () => {
  const mockOnClose = vi.fn();
  const mockOnActualizar = vi.fn();
  const mockSeccion = {
    idSeccion: 1,
    nombreCurso: "Matemáticas 101",
    anio: 2025,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza correctamente con los datos de la sección", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    expect(screen.getByText("Editar Sección")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Matemáticas 101")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025")).toBeInTheDocument();
  });

  test("permite editar el nombre del curso", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "Física Avanzada" } });

    expect(input.value).toBe("Física Avanzada");
  });

  test("permite cambiar el año", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const select = screen.getByDisplayValue("2025");
    fireEvent.change(select, { target: { value: "2026" } });

    expect(select.value).toBe("2026");
  });

  test("muestra error si el nombre está vacío", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "" } });

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(screen.getByText("El nombre de la sección es obligatorio")).toBeInTheDocument();
    expect(mockOnActualizar).not.toHaveBeenCalled();
  });

  test("muestra error si el nombre tiene menos de 3 caracteres", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "AB" } });

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(screen.getByText("El nombre debe tener al menos 3 caracteres")).toBeInTheDocument();
    expect(mockOnActualizar).not.toHaveBeenCalled();
  });

  test("muestra error si no hay cambios", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(screen.getByText("No hay cambios para guardar")).toBeInTheDocument();
    expect(mockOnActualizar).not.toHaveBeenCalled();
  });

  test("llama a onActualizar con los datos correctos", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "Química General" } });

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(mockOnActualizar).toHaveBeenCalledWith({
      nombreCurso: "Química General",
      anio: 2025,
    });
  });

  test("trim espacios en blanco al actualizar", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "  Biología  " } });

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(mockOnActualizar).toHaveBeenCalledWith({
      nombreCurso: "Biología",
      anio: 2025,
    });
  });

  test("limpia el error al escribir en el input", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const btnGuardar = screen.getByText("Guardar Cambios");
    fireEvent.click(btnGuardar);

    expect(screen.getByText("No hay cambios para guardar")).toBeInTheDocument();

    const input = screen.getByDisplayValue("Matemáticas 101");
    fireEvent.change(input, { target: { value: "Nuevo nombre" } });

    expect(screen.queryByText("No hay cambios para guardar")).not.toBeInTheDocument();
  });

  test("cierra el modal al hacer clic en Cancelar", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const btnCancelar = screen.getByText("Cancelar");
    fireEvent.click(btnCancelar);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("muestra años disponibles correctamente", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const anioActual = new Date().getFullYear();
    const select = screen.getByDisplayValue("2025");

    // Verificar que existen las opciones de años
    for (let i = 0; i < 4; i++) {
      expect(screen.getByText(String(anioActual + i))).toBeInTheDocument();
    }
  });

  test("carga datos de la sección al abrir", async () => {
    const { rerender } = render(
      <EditarSeccionModal
        open={false}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={null}
      />
    );

    rerender(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Matemáticas 101")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025")).toBeInTheDocument();
    });
  });

  test("respeta el límite de 40 caracteres", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onActualizar={mockOnActualizar}
        seccion={mockSeccion}
      />
    );

    const input = screen.getByDisplayValue("Matemáticas 101");
    expect(input).toHaveAttribute("maxLength", "40");
  });
});