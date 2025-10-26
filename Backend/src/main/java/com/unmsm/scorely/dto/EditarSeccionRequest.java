package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditarSeccionRequest {
    private String nombreCurso;
    private Integer anio;
}