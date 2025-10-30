package com.unmsm.scorely.exception;

public class InvitacionDuplicadaException extends RuntimeException {
    public InvitacionDuplicadaException() {
        super("Ya existe una invitación pendiente para este correo");
    }
}
