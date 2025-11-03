package com.unmsm.scorely.exception;

public class RegistroCodigoExistente extends RuntimeException {
    public RegistroCodigoExistente() {
        super("El código de Estudiante ya está registrado");
    }
}
