package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearTareaRequest {
    private Integer idSeccion;
    private String nombre;
    private String tipo;
    private String descripcion;
    private LocalDateTime fechaVencimiento;
}