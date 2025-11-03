package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.AlumnoDTO;
import com.unmsm.scorely.dto.CrearGrupoRequest;
import com.unmsm.scorely.dto.CrearGrupoResponse;
import com.unmsm.scorely.dto.ObtenerCompanerosRequest;
import com.unmsm.scorely.dto.ObtenerCompanerosResponse;
import com.unmsm.scorely.services.GrupoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    /**
     * GET /api/grupos
     * Lista todos los grupos
     */
    @GetMapping
    public ResponseEntity<List<CrearGrupoResponse>> listarGrupos() {
        try {
            List<CrearGrupoResponse> grupos = grupoService.listarGrupos();
            return ResponseEntity.ok(grupos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/grupos/{idGrupo}
     * Obtiene el detalle de un grupo por ID
     */
    @GetMapping("/{idGrupo}")
    public ResponseEntity<?> obtenerGrupoPorId(@PathVariable Integer idGrupo) {
        try {
            Optional<CrearGrupoResponse> grupo = grupoService.obtenerGrupoPorId(idGrupo);
            return grupo.<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener el grupo");
        }
    }

    /**
     * GET /api/grupos/seccion/{idSeccion}/alumnos-disponibles
     * Obtiene los alumnos sin grupo de una sección
     */
    @GetMapping("/seccion/{idSeccion}/alumnos-disponibles")
    public ResponseEntity<List<AlumnoDTO>> getAlumnosDisponibles(@PathVariable Integer idSeccion) {
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
    public ResponseEntity<List<AlumnoDTO>> getAllAlumnos(@PathVariable Integer idSeccion) {
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
    public ResponseEntity<Object> crearGrupo(@Valid @RequestBody CrearGrupoRequest request) {
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
     * POST /api/grupos/companeros
     * Devuelve los compañeros de un estudiante en una sección (request body)
     */
    @PostMapping("/companeros")
    public ResponseEntity<List<ObtenerCompanerosResponse>> obtenerCompaneros(
            @RequestBody ObtenerCompanerosRequest request) {
        List<ObtenerCompanerosResponse> companeros =
                grupoService.obtenerCompaneros(request.getId_seccion(), request.getId_persona());
        return ResponseEntity.ok(companeros);
    }

    /**
     * DELETE /api/grupos/{idGrupo}
     * Elimina un grupo por su ID
     */
    @DeleteMapping("/{idGrupo}")
    public ResponseEntity<?> eliminarGrupo(@PathVariable Integer idGrupo) {
        try {
            grupoService.eliminarGrupo(idGrupo);
            return ResponseEntity.noContent().build(); // 204
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar el grupo");
        }
    }
}
