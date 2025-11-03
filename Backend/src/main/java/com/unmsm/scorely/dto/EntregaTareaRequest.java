package com.unmsm.scorely.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntregaTareaRequest {
    private Integer idPersona;
    private Integer idTarea;
    private String enlace;
}