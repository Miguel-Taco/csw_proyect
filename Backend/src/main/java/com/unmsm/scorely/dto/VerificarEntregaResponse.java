package com.unmsm.scorely.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerificarEntregaResponse {
    private Boolean existe;
    private Integer idEntrega;
    private String enlace;
    private LocalDateTime fechaEntrega;
    private Double nota;
    private String mensaje;
}