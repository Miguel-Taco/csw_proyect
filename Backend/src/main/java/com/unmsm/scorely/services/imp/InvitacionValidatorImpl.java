package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.enums.EstadoInvitacion;
import com.unmsm.scorely.exception.InvitacionException;
import com.unmsm.scorely.models.Invitacion;
import com.unmsm.scorely.services.InvitacionValidator;
import org.springframework.stereotype.Component;

@Component
public class InvitacionValidatorImpl implements InvitacionValidator {
    @Override
    public void validarInvitacion(Invitacion invitacion) {
        if (invitacion.isExpirada()) {
            invitacion.setEstado(EstadoInvitacion.EXPIRADA);
            throw new InvitacionException("Invitacion expirada");
        }

        if (!invitacion.isPendiente()) {
            throw new IllegalStateException("La invitación no está en estado pendiente");
        }
    }
}
