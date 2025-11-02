package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObtenerCompanerosResponse {
    private String nombres;
    private String apellido_p;
    private String apellido_m;
    private Integer promedio_final;
}
