package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.RegistrarEntregasRequest;
import com.unmsm.scorely.dto.ActualizarNotaRequest;
import com.unmsm.scorely.models.Entrega;
import com.unmsm.scorely.services.EntregaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;
import java.util.Map;

@RestController
@RequestMapping("/api/entregas")
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    // Registrar entrega con nota
    @PostMapping
    public ResponseEntity<?> registrarEntrega(@RequestBody RegistrarEntregasRequest req) {
        try {
            Entrega creada = entregaService.registrarEntregaConNota(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idEntrega", creada.getIdEntrega()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar nota por idEntrega
    @PutMapping("/{idEntrega}/nota")
    public ResponseEntity<?> actualizarNotaPorEntrega(@PathVariable Integer idEntrega,
                                                      @RequestBody ActualizarNotaRequest req) {
        try {
            entregaService.actualizarNotaPorIdEntrega(idEntrega, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Actualizar nota por tarea + alumno (actualiza la última entrega)
    @PutMapping("/tarea/{idTarea}/alumno/{idAlumno}/nota")
    public ResponseEntity<?> actualizarNotaPorTareaYAlumno(@PathVariable Integer idTarea,
                                                           @PathVariable Integer idAlumno,
                                                           @RequestBody ActualizarNotaRequest req) {
        try {
            entregaService.actualizarNotaPorTareaYAlumno(idTarea, idAlumno, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
