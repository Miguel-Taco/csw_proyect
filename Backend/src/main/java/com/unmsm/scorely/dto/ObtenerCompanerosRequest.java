package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObtenerCompanerosRequest {
    private Integer id_seccion;
    private Integer id_persona;
}
