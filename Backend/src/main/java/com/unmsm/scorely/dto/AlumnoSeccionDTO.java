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
public class AlumnoSeccionDTO {
    private Integer idAlumno;
    private Integer idPersona;
    private String nombreCompleto;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String codigoAlumno;
    private BigDecimal promedioFinal;
    private Integer idSeccion;
    private String nombreCurso;
}