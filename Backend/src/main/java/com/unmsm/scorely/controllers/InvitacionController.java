package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.*;
import com.unmsm.scorely.services.InvitacionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitaciones")
@Slf4j
public class InvitacionController {

    private final InvitacionService invitacionService;

    public InvitacionController(InvitacionService invitacionService) {
        this.invitacionService = invitacionService;
    }

    /**
     * Endpoint para que el profesor cree una invitación
     * POST /api/invitaciones
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InvitacionResponse>> crearInvitacion(
            @Valid @RequestBody InvitacionRequest request
    ) {
        log.info("Solicitud de creación de invitación recibida");

        Integer idProfesor = invitacionService.buscarProfesorPorIdPersona(request.getIdPersona());

        InvitacionResponse response = invitacionService.crearInvitacion(request, idProfesor);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Invitación enviada exitosamente"));
    }

    /**
     * Endpoint para obtener información de una invitación por token
     * GET /api/invitaciones/info?token=xxx
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<InvitacionResponse>> obtenerInformacionInvitacion(
            @RequestParam String token
    ) {
        log.info("Consultando información de invitación");

        InvitacionResponse response = invitacionService.obtenerInvitacionPorToken(token);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Información de invitación obtenida")
        );
    }

    @PostMapping("/confirmar")
    public ResponseEntity<ApiResponse<AceptarInvitacionResponse>> confirmarAceptacion(
            @Valid @RequestBody AceptarInvitacionRequest request
    ) {
        log.info("Confirmando aceptación de invitación provisional");

        Integer idPersona = request.getIdAlumno(); // viene del frontend
        Integer idAlumno = invitacionService.buscarAlumnoPorIdPersona(idPersona);

        AceptarInvitacionResponse response = invitacionService.aceptarInvitacion(
                request.getToken(),
                idAlumno
        );

        if (response.isExito()) {
            return ResponseEntity.ok(ApiResponse.success(response, "Te has unido al curso exitosamente"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.success(response, response.getMensaje()));
        }
    }

    /**
     * Endpoint para obtener invitaciones pendientes de un alumno
     * GET /api/invitaciones/pendientes/correo
     */
    @GetMapping("/pendientes")
    public ResponseEntity<ApiResponse<List<InvitacionResponse>>> obtenerInvitacionesPendientesPorCorreo(
            @RequestParam String correo
    ) {
        log.info("Obteniendo invitaciones pendientes para el alumno con correo: {}", correo);

        List<InvitacionResponse> pendientes = invitacionService.obtenerInvitacionesPendientes(correo);

        return ResponseEntity.ok(ApiResponse.success(pendientes, "Invitaciones pendientes obtenidas"));
    }

    /**
     * Endpoint para rechazar una invitación
     * POST /api/invitaciones/rechazar
     */
    @PostMapping("/rechazar")
    public ResponseEntity<ApiResponse<String>> rechazarInvitacion(
            @Valid @RequestBody AceptarInvitacionRequest request
    ) {
        log.info("Rechazando invitación");

        invitacionService.rechazarInvitacion(request.getToken());

        return ResponseEntity.ok(
                ApiResponse.success("Invitación rechazada", "Invitación rechazada exitosamente")
        );
    }
}