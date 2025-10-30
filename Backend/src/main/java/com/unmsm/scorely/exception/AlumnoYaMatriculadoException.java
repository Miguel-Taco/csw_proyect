package com.unmsm.scorely.exception;

public class AlumnoYaMatriculadoException extends RuntimeException {
    public AlumnoYaMatriculadoException() {
        super("El alumno ya está matriculado en esta sección");
    }
}
