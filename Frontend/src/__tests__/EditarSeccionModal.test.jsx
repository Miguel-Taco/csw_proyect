import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditarSeccionModal from "../componentes/EditarSeccionModal"; // ajusta la ruta si es distinta
import React from "react";

// mock de showModal y close, antes del describe
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("EditarSeccionModal", () => {
  let mockOnClose;
  let mockOnEditar;
  let mockSeccion;
  let anioActual;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnEditar = vi.fn();
    anioActual = 2025;

    mockSeccion = {
      idSeccion: 1,
      nombreCurso: "Calidad de Software",
      anio: 2025,
    };
  });

  // 🧩 Test 1: Renderiza correctamente
  it("debe renderizar correctamente cuando open es true", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    expect(screen.getByText("Editar Sección")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Calidad de Software")).toBeInTheDocument();
    expect(screen.getByDisplayValue(String(anioActual))).toBeInTheDocument();
  });

  // 🧩 Test 2: Muestra error si el nombre está vacío
  it("muestra un mensaje de error si el nombre está vacío", async () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "" } });

    const guardarBtn = screen.getByText("Guardar Cambios");
    fireEvent.click(guardarBtn);

    expect(await screen.findByText("El nombre de la sección es obligatorio")).toBeInTheDocument();
    expect(mockOnEditar).not.toHaveBeenCalled();
  });

  // 🧩 Test 3: Muestra error si el nombre tiene menos de 3 caracteres
  it("muestra un error si el nombre tiene menos de 3 caracteres", async () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "AB" } });

    const guardarBtn = screen.getByText("Guardar Cambios");
    fireEvent.click(guardarBtn);

    expect(await screen.findByText("El nombre debe tener al menos 3 caracteres")).toBeInTheDocument();
    expect(mockOnEditar).not.toHaveBeenCalled();
  });

  // 🧩 Test 4: Muestra error si no hay cambios
  it("muestra error si no se realizaron cambios", async () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    const guardarBtn = screen.getByText("Guardar Cambios");
    fireEvent.click(guardarBtn);

    expect(await screen.findByText("No se realizaron cambios")).toBeInTheDocument();
    expect(mockOnEditar).not.toHaveBeenCalled();
  });

  // 🧩 Test 5: Llama correctamente a onEditar con datos actualizados
  it("llama a onEditar con los nuevos valores cuando se guardan cambios válidos", async () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    const input = screen.getByPlaceholderText("Ej: CALIDAD DE SOFTWARE - G1");
    fireEvent.change(input, { target: { value: "Nuevo Nombre" } });

    const select = screen.getByDisplayValue(String(anioActual));
    fireEvent.change(select, { target: { value: String(anioActual + 1) } });

    const guardarBtn = screen.getByText("Guardar Cambios");
    fireEvent.click(guardarBtn);

    await waitFor(() => {
      expect(mockOnEditar).toHaveBeenCalledWith(
        mockSeccion.idSeccion,
        "Nuevo Nombre",
        anioActual + 1
      );
    });
  });

  // 🧩 Test 6: Llama a onClose al presionar el botón “Cancelar”
  it("llama a onClose al hacer clic en Cancelar", () => {
    render(
      <EditarSeccionModal
        open={true}
        onClose={mockOnClose}
        onEditar={mockOnEditar}
        seccion={mockSeccion}
        anioActual={anioActual}
      />
    );

    const cancelarBtn = screen.getByText("Cancelar");
    fireEvent.click(cancelarBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});