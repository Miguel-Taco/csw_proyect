import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SeccionCard from "../componentes/SeccionAlumnoCard";
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

// Wrapper para agregar Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SeccionCard", () => {
  const mockSeccion = {
    idSeccion: 1,
    nombreCurso: "Matemáticas",
    anio: 2024,
    nombreProfesor: "Juan Pérez"
  };

  // Limpiar mocks antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza la tarjeta con toda la información de la sección", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    expect(screen.getByText("Matemáticas2024")).toBeInTheDocument();
    expect(screen.getByText("Profesor: Juan Pérez")).toBeInTheDocument();
  });

  test("combina correctamente el nombre del curso con el año", () => {
    const seccionConAnio = {
      ...mockSeccion,
      nombreCurso: "Física",
      anio: 2025
    };
    
    renderWithRouter(<SeccionCard seccion={seccionConAnio} />);
    
    expect(screen.getByText("Física2025")).toBeInTheDocument();
  });

  test("muestra el nombre del profesor correctamente", () => {
    const seccionConProfesor = {
      ...mockSeccion,
      nombreProfesor: "María González"
    };
    
    renderWithRouter(<SeccionCard seccion={seccionConProfesor} />);
    
    expect(screen.getByText("Profesor: María González")).toBeInTheDocument();
  });

  test("tiene el cursor pointer al pasar el mouse", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const card = screen.getByText("Matemáticas2024").closest('.seccion-card');
    expect(card).toHaveStyle({ cursor: 'pointer' });
  });

  test("navega a la página de tareas al hacer clic en la tarjeta", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const card = screen.getByText("Matemáticas2024").closest('.seccion-card');
    fireEvent.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith("/alumno/seccion/1/tareas");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  test("navega con el ID correcto para diferentes secciones", () => {
    const seccionDiferente = {
      ...mockSeccion,
      idSeccion: 5
    };
    
    renderWithRouter(<SeccionCard seccion={seccionDiferente} />);
    
    const card = screen.getByText("Matemáticas2024").closest('.seccion-card');
    fireEvent.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith("/alumno/seccion/5/tareas");
  });

  test("renderiza correctamente con diferentes cursos", () => {
    const seccionQuimica = {
      idSeccion: 3,
      nombreCurso: "Química",
      anio: 2024,
      nombreProfesor: "Carlos Rodríguez"
    };
    
    renderWithRouter(<SeccionCard seccion={seccionQuimica} />);
    
    expect(screen.getByText("Química2024")).toBeInTheDocument();
    expect(screen.getByText("Profesor: Carlos Rodríguez")).toBeInTheDocument();
  });

  test("aplica la clase CSS correcta al contenedor principal", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const card = screen.getByText("Matemáticas2024").closest('.seccion-card');
    expect(card).toHaveClass('seccion-card');
  });

  test("aplica la clase CSS correcta al contenedor de datos", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const dataContainer = screen.getByText("Matemáticas2024").closest('.seccion-card-data');
    expect(dataContainer).toHaveClass('seccion-card-data');
  });

  test("el texto del nombre tiene la clase CSS correcta", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const nombreElement = screen.getByText("Matemáticas2024");
    expect(nombreElement).toHaveClass('seccion-nombre');
  });

  test("el texto del profesor tiene la clase CSS correcta", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const profesorElement = screen.getByText("Profesor: Juan Pérez");
    expect(profesorElement).toHaveClass('seccion-profesor');
  });

  test("maneja correctamente secciones con años diferentes", () => {
    const seccion2023 = {
      ...mockSeccion,
      anio: 2023
    };
    
    renderWithRouter(<SeccionCard seccion={seccion2023} />);
    
    expect(screen.getByText("Matemáticas2023")).toBeInTheDocument();
  });

  test("el click en cualquier parte de la tarjeta dispara la navegación", () => {
    renderWithRouter(<SeccionCard seccion={mockSeccion} />);
    
    const profesorText = screen.getByText("Profesor: Juan Pérez");
    fireEvent.click(profesorText);
    
    expect(mockNavigate).toHaveBeenCalledWith("/alumno/seccion/1/tareas");
  });

  test("renderiza múltiples tarjetas sin conflicto", () => {
    const seccion1 = { ...mockSeccion, idSeccion: 1, nombreCurso: "Matemáticas" };
    const seccion2 = { ...mockSeccion, idSeccion: 2, nombreCurso: "Historia" };
    
    const { rerender } = renderWithRouter(<SeccionCard seccion={seccion1} />);
    expect(screen.getByText("Matemáticas2024")).toBeInTheDocument();
    
    rerender(
      <BrowserRouter>
        <SeccionCard seccion={seccion2} />
      </BrowserRouter>
    );
    expect(screen.getByText("Historia2024")).toBeInTheDocument();
  });

});