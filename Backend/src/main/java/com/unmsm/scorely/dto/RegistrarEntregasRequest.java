package com.unmsm.scorely.dto;


import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class RegistrarEntregasRequest {
    private Integer idTarea;
    private Integer idAlumno;
    private Integer idGrupo;
    private Double nota;
}
