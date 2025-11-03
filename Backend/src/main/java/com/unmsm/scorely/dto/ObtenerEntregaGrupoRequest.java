package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObtenerEntregaGrupoRequest {
    private Integer idSeccion;
    private Integer idGrupo;
    private Integer idTarea;
}
