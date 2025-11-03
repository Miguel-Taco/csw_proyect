package com.unmsm.scorely.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntregaTareaResponse {
    private Integer idEntrega;
    private String tipoTarea;
    private String operacion; // "creada" o "actualizada"
    private String mensaje;
    private Boolean success;
}