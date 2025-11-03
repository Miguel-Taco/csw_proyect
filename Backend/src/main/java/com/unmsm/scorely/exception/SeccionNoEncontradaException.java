package com.unmsm.scorely.exception;

public class SeccionNoEncontradaException extends RuntimeException {
    public SeccionNoEncontradaException(Integer idSeccion) {
        super("Sección no encontrada con ID:" + idSeccion);
    }
}
