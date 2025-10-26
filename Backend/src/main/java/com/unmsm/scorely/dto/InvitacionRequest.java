package com.unmsm.scorely.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitacionRequest {

    @NotNull(message = "El ID de la sección es requerido")
    private Integer idSeccion;

    @NotBlank(message = "El correo es requerido")
    @Email(message = "Formato de correo inválido")
    private String correoAlumno;
}
