package com.unmsm.scorely.controllers;

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
@CrossOrigin(origins = "*")
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
                response.put("success", true);
                response.put("idProfesor", idProfesor);
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> {
                response.put("success", false);
                response.put("message", "No se encontró profesor con ese id_persona");
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
            response.put("success", true);
            response.put("message", "Sección creada exitosamente");
            response.put("seccion", nuevaSeccion);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear la sección: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ✅ MÉTODO ACTUALIZADO - Editar sección
    @PutMapping("/{idSeccion}/profesor/{idProfesor}")
    public ResponseEntity<Map<String, Object>> editarSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idProfesor,
            @RequestBody EditarSeccionRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (request.getNombreCurso() == null || request.getNombreCurso().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El nombre del curso es obligatorio");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (request.getAnio() == null) {
                response.put("success", false);
                response.put("message", "El año es obligatorio");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // 🔵 ahora el service devuelve DTO
            SeccionDTO dto = seccionService.editarSeccion(idSeccion, idProfesor, request);

            response.put("success", true);
            response.put("message", "Sección actualizada exitosamente");
            response.put("seccion", dto); // ✅ DTO, no entidad JPA
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al editar la sección: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/{idSeccion}/profesor/{idProfesor}")
    public ResponseEntity<Map<String, Object>> eliminarSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idProfesor) {
        Map<String, Object> response = new HashMap<>();
        
        boolean eliminado = seccionService.eliminarSeccion(idSeccion, idProfesor);
        
        if (eliminado) {
            response.put("success", true);
            response.put("message", "Sección eliminada exitosamente");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "No se pudo eliminar la sección. Verifique los permisos.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }
}