package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.GrupoInfoAlumnoDTO;
import com.unmsm.scorely.services.AlumnoGrupoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlumnoGrupoController {

    private final AlumnoGrupoService alumnoGrupoService;

    /**
     * GET /api/alumnos/{idAlumno}/seccion/{idSeccion}/grupo
     * Obtiene la información del grupo al que pertenece un alumno en una sección
     */
    @GetMapping("/{idAlumno}/seccion/{idSeccion}/grupo")
    public ResponseEntity<?> getGrupoInfo(
            @PathVariable Integer idAlumno,
            @PathVariable Integer idSeccion) {
        try {
            GrupoInfoAlumnoDTO grupoInfo = alumnoGrupoService
                    .getGrupoInfoByAlumnoAndSeccion(idAlumno, idSeccion);

            if (grupoInfo == null) {
                return ResponseEntity.ok()
                        .body("El alumno no pertenece a ningún grupo en esta sección");
            }

            return ResponseEntity.ok(grupoInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener información del grupo");
        }
    }
}