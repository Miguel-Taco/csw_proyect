package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObtenerEntregaGrupoResponse {
    private boolean success;
    private String message;
    private String fechaEntrega;
    private String enlace;
    private Double nota;
}