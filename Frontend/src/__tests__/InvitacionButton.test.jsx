import { render, screen, fireEvent } from "@testing-library/react";
import InvitacionButton from "../componentes/InvitacionButton";
import { vi } from "vitest";

// Mock del modal que desmonta el contenido
vi.mock("../componentes/InvitacionModal", () => ({
  default: ({ open, children }) => (open ? <div>{children}</div> : null),
}));

describe("InvitacionButton", () => {
  test("renderiza el botón inicial", () => {
    render(<InvitacionButton />);
    expect(screen.getByRole("button", { name: /invitar alumno/i })).toBeInTheDocument();
  });

  test("abre el modal al hacer clic en 'Invitar Alumno'", () => {
    render(<InvitacionButton />);

    const boton = screen.getByRole("button", { name: /invitar alumno/i });
    fireEvent.click(boton); 

     expect(screen.getByText("Correo del alumno")).toBeInTheDocument();
  });

  test("permite escribir un correo en el input", () => {
    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "test@correo.com" } });

    expect(input.value).toBe("test@correo.com");
  });

  test("cierra el modal al hacer clic en Cancelar", () => {
    render(<InvitacionButton />);
    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByText("Correo del alumno")).not.toBeInTheDocument();
  });

  test("envía el formulario y cierra el modal", () => {
    render(<InvitacionButton />);

    fireEvent.click(screen.getByRole("button", { name: /invitar alumno/i }));

    const input = screen.getByPlaceholderText("alumno@correo.com");
    fireEvent.change(input, { target: { value: "alumno@correo.com" } });

    fireEvent.click(screen.getByRole("button", { name: /enviar invitación/i }));

    expect(screen.queryByText("Correo del alumno")).not.toBeInTheDocument();
  });
});