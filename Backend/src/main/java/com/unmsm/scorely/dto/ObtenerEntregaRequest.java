package com.unmsm.scorely.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObtenerEntregaRequest {

    @NotNull(message = "El id de la sección es obligatorio")
    @Positive(message = "El id de la sección debe ser positivo")
    private Integer idSeccion;

    @NotNull(message = "El id del alumno es obligatorio")
    @Positive(message = "El id del alumno debe ser positivo")
    private Integer idAlumno;

    @NotNull(message = "El id de la tarea es obligatorio")
    @Positive(message = "El id de la tarea debe ser positivo")
    private Integer idTarea;
}
