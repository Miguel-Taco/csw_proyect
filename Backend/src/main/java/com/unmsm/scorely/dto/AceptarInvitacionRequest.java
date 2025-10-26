package com.unmsm.scorely.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AceptarInvitacionRequest {

    @NotBlank(message = "El token es requerido")
    private String token;

    private Integer idAlumno;
}