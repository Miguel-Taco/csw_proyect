package com.unmsm.scorely.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AceptarInvitacionResponse {

    private boolean exito;
    private String mensaje;
    private String estado;
    private Integer idSeccion;
    private String nombreCurso;
    private boolean requiereLogin;

    public static AceptarInvitacionResponse expirada() {
        return AceptarInvitacionResponse.builder()
                .exito(false)
                .mensaje("La invitación ha expirado")
                .estado("EXPIRADA")
                .requiereLogin(false)
                .build();
    }

    public static AceptarInvitacionResponse yaMatriculado(String nombreCurso) {
        return AceptarInvitacionResponse.builder()
                .exito(false)
                .mensaje("Ya estás matriculado en este curso")
                .estado("YA_MATRICULADO")
                .nombreCurso(nombreCurso)
                .requiereLogin(false)
                .build();
    }

    public static AceptarInvitacionResponse exitosa(Integer idSeccion, String nombreCurso) {
        return AceptarInvitacionResponse.builder()
                .exito(true)
                .mensaje("Te has unido exitosamente al curso")
                .estado("ACEPTADA")
                .idSeccion(idSeccion)
                .nombreCurso(nombreCurso)
                .requiereLogin(false)
                .build();
    }

    public static AceptarInvitacionResponse requiereLogin(Integer idSeccion, String nombreCurso) {
        return AceptarInvitacionResponse.builder()
                .exito(false)
                .mensaje("Debes iniciar sesión para unirte al curso")
                .estado("REQUIERE_LOGIN")
                .idSeccion(idSeccion)
                .nombreCurso(nombreCurso)
                .requiereLogin(true)
                .build();
    }
}
