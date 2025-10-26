package com.unmsm.scorely.services;

import com.unmsm.scorely.models.Invitacion;

public interface EmailService {
    void enviarInvitacion(Invitacion invitacion);
}
