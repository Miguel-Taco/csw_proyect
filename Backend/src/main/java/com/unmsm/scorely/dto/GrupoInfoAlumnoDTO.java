package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GrupoInfoAlumnoDTO {

    private Integer idGrupo;
    private String nombreGrupo;
    private Integer promedioFinal;
    private String nombreSeccion;
    private Integer cantidadIntegrantes;
    private List<IntegranteDTO> integrantes;
    private Integer totalTareas;
    private List<TareaGrupalDTO> tareas;
    private Double promedioActual;

    // DTO para integrantes del grupo
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IntegranteDTO {
        private Integer idAlumno;
        private String nombreCompleto;
        private String codigoAlumno;
    }

    // DTO para tareas grupales
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TareaGrupalDTO {
        private Integer idTarea;
        private String nombreTarea;
        private Double nota;
        private String fechaEntrega;
    }
}