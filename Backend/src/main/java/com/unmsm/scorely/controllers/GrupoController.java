package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.*;
import com.unmsm.scorely.services.GrupoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    /**
     * GET /api/grupos/seccion/{idSeccion}/alumnos-disponibles
     * Obtiene los alumnos sin grupo de una sección
     */
    @GetMapping("/seccion/{idSeccion}/alumnos-disponibles")
    public ResponseEntity<List<AlumnoDTO>> getAlumnosDisponibles(
            @PathVariable Integer idSeccion) {
        try {
            List<AlumnoDTO> alumnos = grupoService.getAlumnosDisponiblesBySeccion(idSeccion);
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/grupos/seccion/{idSeccion}/alumnos
     * Obtiene todos los alumnos de una sección (con y sin grupo)
     */
    @GetMapping("/seccion/{idSeccion}/alumnos")
    public ResponseEntity<List<AlumnoDTO>> getAllAlumnos(
            @PathVariable Integer idSeccion) {
        try {
            List<AlumnoDTO> alumnos = grupoService.getAllAlumnosBySeccion(idSeccion);
            return ResponseEntity.ok(alumnos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/grupos
     * Crea un nuevo grupo con los alumnos seleccionados
     */
    @PostMapping
    public ResponseEntity<?> crearGrupo(@Valid @RequestBody CrearGrupoRequest request) {
        try {
            CrearGrupoResponse response = grupoService.crearGrupo(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear el grupo");
        }
    }

    /**
     * GET /api/grupos/seccion/{idSeccion}/idPersona/{idPersona}
     * Obtiene el grupo al que pertenece un estudiante en una seccion
     */
    @PostMapping("/companeros")
    public ResponseEntity<List<ObtenerCompanerosResponse>> obtenerCompaneros(
            @RequestBody ObtenerCompanerosRequest request) {
        List<ObtenerCompanerosResponse> companeros =
                grupoService.obtenerCompaneros(request.getId_seccion(), request.getId_persona());
        return ResponseEntity.ok(companeros);
    }


}