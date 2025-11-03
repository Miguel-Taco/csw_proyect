package com.unmsm.scorely.controllers;

import com.unmsm.scorely.constants.ErrorConstants;

import com.unmsm.scorely.dto.CrearSeccionRequest;
import com.unmsm.scorely.dto.EditarSeccionRequest;
import com.unmsm.scorely.dto.SeccionDTO;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.ProfesorRepository;
import com.unmsm.scorely.services.SeccionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/secciones")
public class SeccionController {

    private final SeccionService seccionService;
    private final ProfesorRepository profesorRepository;

    public SeccionController(SeccionService seccionService, ProfesorRepository profesorRepository) {
        this.seccionService = seccionService;
        this.profesorRepository = profesorRepository;
    }

    // NUEVO: Obtener id_profesor desde id_persona
    @GetMapping("/profesor-id/{idPersona}")
    public ResponseEntity<Map<String, Object>> obtenerIdProfesor(@PathVariable Integer idPersona) {
        Map<String, Object> response = new HashMap<>();

        return profesorRepository.findIdProfesorByIdPersona(idPersona)
                .map(idProfesor -> {
                    // USA CONSTANTES
                    response.put(ErrorConstants.SUCCESS_KEY, true);
                    response.put(ErrorConstants.ID_PROFESOR_KEY, idProfesor);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    // USA CONSTANTES
                    response.put(ErrorConstants.SUCCESS_KEY, false);
                    response.put(ErrorConstants.MESSAGE_KEY, "No se encontró profesor con ese id_persona");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }
    // GET: Obtener secciones de un profesor
    @GetMapping("/profesor/{idProfesor}")
    public ResponseEntity<List<Seccion>> obtenerSeccionesPorProfesor(@PathVariable Integer idProfesor) {
        List<Seccion> secciones = seccionService.obtenerSeccionesPorProfesor(idProfesor);
        return ResponseEntity.ok(secciones);
    }

    // GET: Obtener secciones de un profesor por año
    @GetMapping("/profesor/{idProfesor}/anio/{anio}")
    public ResponseEntity<List<SeccionDTO>> obtenerSeccionesPorProfesorYAnio(
            @PathVariable Integer idProfesor,
            @PathVariable Integer anio) {
        List<SeccionDTO> secciones = seccionService.obtenerSeccionesPorProfesorYAnio(idProfesor, anio);
        return ResponseEntity.ok(secciones  );
    }

    // POST: Crear nueva sección
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearSeccion(@RequestBody CrearSeccionRequest req) {
        Map<String, Object> response = new HashMap<>();
        try {
            Seccion nuevaSeccion = seccionService.crearSeccion(req);
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, true);
            response.put(ErrorConstants.MESSAGE_KEY, "Sección creada exitosamente");
            response.put(ErrorConstants.SECCION_KEY, nuevaSeccion);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, false);
            response.put(ErrorConstants.MESSAGE_KEY, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, false);
            response.put(ErrorConstants.MESSAGE_KEY, "Error al crear la sección: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // POST: Editar sección
    @PutMapping("/{idSeccion}/profesor/{idProfesor}")
    public ResponseEntity<Map<String, Object>> editarSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idProfesor,
            @RequestBody EditarSeccionRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (request.getNombreCurso() == null || request.getNombreCurso().trim().isEmpty()) {
                // USA CONSTANTES
                response.put(ErrorConstants.SUCCESS_KEY, false);
                response.put(ErrorConstants.MESSAGE_KEY, "El nombre del curso es obligatorio");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (request.getAnio() == null) {
                // USA CONSTANTES
                response.put(ErrorConstants.SUCCESS_KEY, false);
                response.put(ErrorConstants.MESSAGE_KEY, "El año es obligatorio");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            SeccionDTO dto = seccionService.editarSeccion(idSeccion, idProfesor, request);

            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, true);
            response.put(ErrorConstants.MESSAGE_KEY, "Sección actualizada exitosamente");
            response.put(ErrorConstants.SECCION_KEY, dto);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, false);
            response.put(ErrorConstants.MESSAGE_KEY, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{idSeccion}/profesor/{idProfesor}")
    public ResponseEntity<Map<String, Object>> eliminarSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idProfesor) {
        Map<String, Object> response = new HashMap<>();

        boolean eliminado = seccionService.eliminarSeccion(idSeccion, idProfesor);

        if (eliminado) {
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, true);
            response.put(ErrorConstants.MESSAGE_KEY, "Sección eliminada exitosamente");
            return ResponseEntity.ok(response);
        } else {
            // USA CONSTANTES
            response.put(ErrorConstants.SUCCESS_KEY, false);
            response.put(ErrorConstants.MESSAGE_KEY, "No se pudo eliminar la sección. Verifique los permisos.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }
}