package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CrearSeccionRequest {
    private int id_profesor;
    private String nombreCurso;
    private Integer anio;
    private Integer codigo;
}
