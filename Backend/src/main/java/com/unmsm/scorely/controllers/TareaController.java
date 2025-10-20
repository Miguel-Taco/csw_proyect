package com.unmsm.scorely.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unmsm.scorely.dto.CrearTareaRequest;
import com.unmsm.scorely.models.Tarea;
import com.unmsm.scorely.services.TareaService;

@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*")
public class TareaController {

    private final TareaService tareaService;

    public TareaController(TareaService tareaService) {
        this.tareaService = tareaService;
    }

    // 🔹 Crear nueva tarea
    @PostMapping("/api/tareas")
    public ResponseEntity<?> crearTarea(@RequestBody CrearTareaRequest req) {
        try {
            System.out.println("POST /api/tareas - payload: " + req);
            Tarea creada = tareaService.crearTarea(req);
            if (creada == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body("Error al crear la tarea (servicio retornó null)");
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Error al crear la tarea: " + e.getMessage());
        }
    }

    // 🔹 Listar tareas por sección
    @GetMapping("/seccion/{idSeccion}")
    public ResponseEntity<Map<String, Object>> listarPorSeccion(@PathVariable Integer idSeccion) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Tarea> tareas = tareaService.listarPorSeccion(idSeccion);
            response.put("success", true);
            response.put("tareas", tareas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener tareas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 🔹 Obtener tarea por ID
    @GetMapping("/{idTarea}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer idTarea) {
        Map<String, Object> response = new HashMap<>();
        try {
            Tarea tarea = tareaService.obtenerPorId(idTarea);
            if (tarea != null) {
                response.put("success", true);
                response.put("tarea", tarea);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No se encontró la tarea");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener la tarea: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 🔹 Actualizar tarea
    @PutMapping("/{idTarea}")
    public ResponseEntity<Map<String, Object>> actualizarTarea(
            @PathVariable Integer idTarea,
            @RequestBody CrearTareaRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Tarea actualizada = tareaService.actualizarTarea(idTarea, request);
            if (actualizada != null) {
                response.put("success", true);
                response.put("message", "Tarea actualizada exitosamente");
                response.put("tarea", actualizada);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No se encontró la tarea para actualizar");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar la tarea: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 🔹 Eliminar tarea
    @DeleteMapping("/{idTarea}")
    public ResponseEntity<Map<String, Object>> eliminarTarea(@PathVariable Integer idTarea) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean eliminado = tareaService.eliminarTarea(idTarea);
            if (eliminado) {
                response.put("success", true);
                response.put("message", "Tarea eliminada exitosamente");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "No se pudo eliminar la tarea (no existe)");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar la tarea: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
