package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.EntregaTareaRequest;
import com.unmsm.scorely.dto.EntregaTareaResponse;
import com.unmsm.scorely.dto.VerificarEntregaResponse;

public interface EntregarTareaService {
    EntregaTareaResponse guardarEntrega(EntregaTareaRequest request);
    VerificarEntregaResponse verificarEntrega(Integer idPersona, Integer idTarea);
}
