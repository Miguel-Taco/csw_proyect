package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.RegistroRequest;
import com.unmsm.scorely.models.Persona;

public interface RegistroService {
    Persona registrar(RegistroRequest request);
}
