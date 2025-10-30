import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";

// Mock de fetch globalThis
globalThis.fetch = vi.fn();

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

globalThis.localStorage = localStorageMock;

// Wrapper para proveer el contexto
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("inicializa con usuario null y loading true", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test("restaura sesión desde localStorage al inicializar", async () => {
    const savedUser = {
      id: 1,
      username: "test@correo.com",
      nombres: "Test",
      role: "profesor",
    };

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "currentUser") return JSON.stringify(savedUser);
      if (key === "authToken") return "fake-token-123";
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({ ...savedUser, token: "fake-token-123" });
    expect(result.current.isAuthenticated).toBe(true);
  });


  test("login fallido retorna success false con mensaje de error", async () => {
    const mockResponse = {
      success: false,
      message: "Credenciales inválidas",
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({
        username: "wrong@correo.com",
        password: "wrongpass",
      });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.message).toBe("Credenciales inválidas");
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  test("login maneja errores de red correctamente", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({
        username: "test@correo.com",
        password: "password123",
      });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.message).toBe("Error de conexión. Verifique su conexión a internet.");
    expect(result.current.user).toBeNull();
  });

  test("logout limpia usuario y localStorage", async () => {
    // Primero hacer login
    const mockLoginResponse = {
      success: true,
      user: {
        idPersona: 1,
        correo: "test@correo.com",
        nombres: "Test",
        tipo: "profesor",
      },
      token: "fake-token-123",
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockLoginResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        username: "test@correo.com",
        password: "password123",
      });
    });

    expect(result.current.user).not.toBeNull();

    // Mock del logout endpoint
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Ahora hacer logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("currentUser");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
  });

  test("hasRole verifica correctamente el rol del usuario", async () => {
    const mockResponse = {
      success: true,
      user: {
        idPersona: 1,
        correo: "test@correo.com",
        tipo: "profesor",
      },
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        username: "test@correo.com",
        password: "password123",
      });
    });

    expect(result.current.hasRole("profesor")).toBe(true);
    expect(result.current.hasRole("PROFESOR")).toBe(true);
    expect(result.current.hasRole("alumno")).toBe(false);
  });

  test("updateUser actualiza los datos del usuario", async () => {
    const mockResponse = {
      success: true,
      user: {
        idPersona: 1,
        correo: "test@correo.com",
        nombres: "Test",
        tipo: "profesor",
      },
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        username: "test@correo.com",
        password: "password123",
      });
    });

    const updatedData = { nombres: "Updated Name" };

    await act(async () => {
      result.current.updateUser(updatedData);
    });

    expect(result.current.user.nombres).toBe("Updated Name");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "currentUser",
      expect.stringContaining("Updated Name")
    );
  });

  test("lanza error si useAuth se usa fuera del AuthProvider", () => {
    // Suprimir console.error para este test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth debe ser usado dentro de un AuthProvider");

    spy.mockRestore();
  });

  test("maneja usuario sin token correctamente", async () => {
    const mockResponse = {
      success: true,
      user: {
        idPersona: 1,
        correo: "test@correo.com",
        tipo: "profesor",
      },
      // Sin token
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login({
        username: "test@correo.com",
        password: "password123",
      });
    });

    expect(result.current.user).not.toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "currentUser",
      expect.any(String)
    );
    // No debe intentar guardar authToken si no existe
    expect(
      Array.from(localStorageMock.setItem.mock.calls).some(
        (call) => call[0] === "authToken"
      )
    ).toBe(false);
  });
});