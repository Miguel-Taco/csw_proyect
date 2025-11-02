package com.unmsm.scorely.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoSeccionDTO {
    private Integer idGrupo;
    private String nombreGrupo;
    private BigDecimal promedioFinal;
    private Integer idSeccion;
    private String nombreCurso;
}