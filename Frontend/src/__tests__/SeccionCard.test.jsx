import { render, screen, fireEvent } from "@testing-library/react";
import SeccionCard from "../componentes/SeccionCard";
import { vi, describe, test, expect, beforeEach } from "vitest";

describe("SeccionCard", () => {
  const mockSeccion = {
    idSeccion: 1,
    nombreCurso: "Matemáticas Avanzadas",
    anio: 2025,
  };

  const mockOnEliminar = vi.fn();
  const mockOnEditar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza el nombre del curso correctamente", () => {
    render(
      <SeccionCard
        seccion={mockSeccion}
        onEliminar={mockOnEliminar}
        onEditar={mockOnEditar}
      />
    );

    expect(screen.getByText("Matemáticas Avanzadas")).toBeInTheDocument();
  });

  test("muestra botones de editar y eliminar", () => {
    render(
      <SeccionCard
        seccion={mockSeccion}
        onEliminar={mockOnEliminar}
        onEditar={mockOnEditar}
      />
    );

    expect(screen.getByTitle("Editar sección")).toBeInTheDocument();
    expect(screen.getByTitle("Eliminar sección")).toBeInTheDocument();
  });

  test("llama a onEditar al hacer clic en el botón de editar", () => {
    render(
      <SeccionCard
        seccion={mockSeccion}
        onEliminar={mockOnEliminar}
        onEditar={mockOnEditar}
      />
    );

    const btnEditar = screen.getByTitle("Editar sección");
    fireEvent.click(btnEditar);

    expect(mockOnEditar).toHaveBeenCalledWith(mockSeccion);
  });

    test("muestra confirmación y llama a onEliminar al confirmar", () => {
        global.confirm = vi.fn(() => true);

        render(
        <SeccionCard
            seccion={mockSeccion}
            onEliminar={mockOnEliminar}
            onEditar={mockOnEditar}
        />
        );

        const btnEliminar = screen.getByTitle("Eliminar sección");
        fireEvent.click(btnEliminar);

        expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('¿Está seguro de eliminar la sección "Matemáticas Avanzadas"')
        );
        expect(mockOnEliminar).toHaveBeenCalledWith(1);
    });

  test("no llama a onEliminar si el usuario cancela", () => {
    global.confirm = vi.fn(() => false);

    render(
      <SeccionCard
        seccion={mockSeccion}
        onEliminar={mockOnEliminar}
        onEditar={mockOnEditar}
      />
    );

    const btnEliminar = screen.getByTitle("Eliminar sección");
    fireEvent.click(btnEliminar);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnEliminar).not.toHaveBeenCalled();
  });

  test("stopPropagation funciona correctamente en editar", () => {
    const mockCardClick = vi.fn();

    const { container } = render(
      <div onClick={mockCardClick}>
        <SeccionCard
          seccion={mockSeccion}
          onEliminar={mockOnEliminar}
          onEditar={mockOnEditar}
        />
      </div>
    );

    const btnEditar = screen.getByTitle("Editar sección");
    fireEvent.click(btnEditar);

    expect(mockOnEditar).toHaveBeenCalled();
    expect(mockCardClick).not.toHaveBeenCalled();
  });

  test("stopPropagation funciona correctamente en eliminar", () => {
    global.confirm = vi.fn(() => true);
    const mockCardClick = vi.fn();

    const { container } = render(
      <div onClick={mockCardClick}>
        <SeccionCard
          seccion={mockSeccion}
          onEliminar={mockOnEliminar}
          onEditar={mockOnEditar}
        />
      </div>
    );

    const btnEliminar = screen.getByTitle("Eliminar sección");
    fireEvent.click(btnEliminar);

    expect(mockOnEliminar).toHaveBeenCalled();
    expect(mockCardClick).not.toHaveBeenCalled();
  });
});