package com.unmsm.scorely.exception;

public class InvitacionAceptadaYaRechazadaException extends RuntimeException {
    public InvitacionAceptadaYaRechazadaException() {
        super("No puedes rechazar una invitación que ya fue aceptada");
    }
}
