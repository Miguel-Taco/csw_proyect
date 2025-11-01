package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.IntegranteGrupoDTO;
import com.unmsm.scorely.dto.RegistrarEntregasRequest;
import com.unmsm.scorely.dto.ActualizarNotaRequest;
import com.unmsm.scorely.dto.NotasDeTareas;
import com.unmsm.scorely.models.Entrega;
import com.unmsm.scorely.services.EntregaGrupalService;
import com.unmsm.scorely.services.EntregaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entregas")
public class EntregaController {

    private final EntregaService entregaService;
    private final EntregaGrupalService entregaGrupalService;

    public EntregaController(EntregaService entregaService, EntregaGrupalService entregaGrupal) {
        this.entregaService = entregaService;
        this.entregaGrupalService = entregaGrupal;
    }

    //Registrar entrega con nota
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

    //Actualizar nota por idEntrega
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

    //LISTAR tareas con notas de un alumno en una sección
    @GetMapping("/seccion/{idSeccion}/alumno/{idAlumno}/tareas-notas")
    public ResponseEntity<?> obtenerTareasNotasAlumno(@PathVariable Integer idSeccion,
                                                      @PathVariable Integer idAlumno) {
        try {
            List<NotasDeTareas> tareasNotas = entregaService.obtenerTareasNotasAlumno(idSeccion, idAlumno);
            return ResponseEntity.ok(tareasNotas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    //ACTUALIZAR nota por tarea + alumno (actualiza la última entrega)
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

    @PostMapping("/grupal")
    public ResponseEntity<?> registrarEntregaGrupal(@RequestBody RegistrarEntregasRequest req) {
        try {
            Entrega creada = entregaGrupalService.registrarEntregaGrupalConNota(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idEntrega", creada.getIdEntrega()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    //LISTAR tareas grupales con notas de un grupo
    @GetMapping("/seccion/{idSeccion}/grupo/{idGrupo}/tareas-notas")  // 👈 Corregí la URL
    public ResponseEntity<?> obtenerTareasNotasGrupo(@PathVariable Integer idSeccion,
                                                     @PathVariable Integer idGrupo) {
        try {
            List<NotasDeTareas> tareasGrupoNotas = entregaGrupalService.obtenerTareasNotasGrupos(idSeccion, idGrupo);
            return ResponseEntity.ok(tareasGrupoNotas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    //ACTUALIZAR nota por tarea + grupo
    @PutMapping("/tarea/{idTarea}/grupo/{idGrupo}/nota")
    public ResponseEntity<?> actualizarNotaPorTareaYGrupo(@PathVariable Integer idTarea,
                                                          @PathVariable Integer idGrupo,
                                                          @RequestBody ActualizarNotaRequest req) {
        try {
            entregaGrupalService.actualizarNotaPorTareaYGrupo(idTarea, idGrupo, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/grupo/{idGrupo}/integrantes")
    public ResponseEntity<?> obtenerIntegrantesGrupo(@PathVariable Integer idGrupo) {
        try {
            List<IntegranteGrupoDTO> integrantes = entregaGrupalService.obtenerIntegrantesGrupo(idGrupo);
            return ResponseEntity.ok(integrantes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}