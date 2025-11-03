package com.unmsm.scorely.exception;

public class RegistroCorreoExistente extends RuntimeException {
    public RegistroCorreoExistente() {
        super("El correo ya está registrado");
    }
}
