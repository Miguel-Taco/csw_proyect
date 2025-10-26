import { render, screen } from "@testing-library/react";
import InvitationModal from "../componentes/InvitacionModal";

// 🧩 Mockea completamente react-dom para reemplazar createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    createPortal: (node) => node, // ← esto hace que el portal se renderice inline
  };
});

beforeAll(() => {
  // Si JSDOM no tiene HTMLDialogElement, lo crea vacío
  if (!window.HTMLDialogElement) {
    window.HTMLDialogElement = class extends HTMLElement {};
  }

  // Añade los métodos showModal y close al prototipo
  window.HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.open = true;
  });
  window.HTMLDialogElement.prototype.close = vi.fn(function () {
    this.open = false;
  });
});

describe("InvitationModal", () => {
  test("renderiza correctamente cuando open=true", () => {
    render(
      <InvitationModal open={true} onClose={() => {}} title="Título de prueba">
        <p>Contenido de prueba</p>
      </InvitationModal>
    );

    expect(screen.getByText("Título de prueba")).toBeInTheDocument();
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  test("no muestra el modal cuando open=false", () => {
    render(
      <InvitationModal open={false} onClose={() => {}} title="Oculto">
        <p>No debería verse</p>
      </InvitationModal>
    );

    const dialog = document.querySelector("dialog");

    // El diálogo existe, pero no debe estar "open"
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBeFalsy();

    // El contenido sigue en el DOM, pero el modal está cerrado
    expect(screen.getByText("Oculto")).toBeInTheDocument();
    expect(screen.getByText("No debería verse")).toBeInTheDocument();

  });

  test("ejecuta onClose al hacer clic en el botón ×", () => {
    const handleClose = vi.fn();
    render(
      <InvitationModal open={true} onClose={handleClose} title="Cerrar prueba">
        <p>Modal de prueba</p>
      </InvitationModal>
    );

    const closeButton = screen.getByRole("button", { name: "Cerrar" });
    closeButton.click();

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
