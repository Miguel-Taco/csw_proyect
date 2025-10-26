package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitacionResponse {

    private Integer idInvitacion;
    private String correo;
    private String nombreCurso;
    private String nombreProfesor;
    private String estado;
    private String token;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaExpiracion;
    private String mensaje;
}
