package com.unmsm.scorely.constants;

public final class ErrorConstants {

    // Constructor privado para prevenir instanciación
    private ErrorConstants() {
        throw new IllegalStateException("Utility class");
    }

    // Constantes existentes (de tu imagen)
    public static final String ERROR_KEY = "error";
    public static final String ID_ENTREGA_KEY = "idEntrega";

    // --- NUEVAS CONSTANTES ---
    // Para solucionar los warnings de SonarQube
    public static final String SUCCESS_KEY = "success";
    public static final String MESSAGE_KEY = "message";

    // Otras claves repetidas en tu controlador
    public static final String ID_PROFESOR_KEY = "idProfesor";
    public static final String SECCION_KEY = "seccion";
}