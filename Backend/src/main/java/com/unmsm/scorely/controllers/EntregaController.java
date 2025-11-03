package com.unmsm.scorely.controllers;

import com.unmsm.scorely.constants.ErrorConstants;
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

    @PostMapping
    public ResponseEntity<Object> registrarEntrega(@RequestBody RegistrarEntregasRequest req) {
        try {
            Entrega creada = entregaService.registrarEntregaConNota(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(ErrorConstants.ID_ENTREGA_KEY, creada.getIdEntrega()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        }
    }

    @PutMapping("/{idEntrega}/nota")
    public ResponseEntity<Object> actualizarNotaPorEntrega(@PathVariable Integer idEntrega,
                                                           @RequestBody ActualizarNotaRequest req) {
        try {
            entregaService.actualizarNotaPorIdEntrega(idEntrega, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/seccion/{idSeccion}/alumno/{idAlumno}/tareas-notas")
    public ResponseEntity<List<NotasDeTareas>> obtenerTareasNotasAlumno(@PathVariable Integer idSeccion,
                                                                        @PathVariable Integer idAlumno) {
        try {
            List<NotasDeTareas> tareasNotas = entregaService.obtenerTareasNotasAlumno(idSeccion, idAlumno);
            return ResponseEntity.ok(tareasNotas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/tarea/{idTarea}/alumno/{idAlumno}/nota")
    public ResponseEntity<Object> actualizarNotaPorTareaYAlumno(@PathVariable Integer idTarea,
                                                                @PathVariable Integer idAlumno,
                                                                @RequestBody ActualizarNotaRequest req) {
        try {
            entregaService.actualizarNotaPorTareaYAlumno(idTarea, idAlumno, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        }
    }

    @PostMapping("/grupal")
    public ResponseEntity<Object> registrarEntregaGrupal(@RequestBody RegistrarEntregasRequest req) {
        try {
            Entrega creada = entregaGrupalService.registrarEntregaGrupalConNota(req);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(ErrorConstants.ID_ENTREGA_KEY, creada.getIdEntrega()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/seccion/{idSeccion}/grupo/{idGrupo}/tareas-notas")
    public ResponseEntity<List<NotasDeTareas>> obtenerTareasNotasGrupo(@PathVariable Integer idSeccion,
                                                                       @PathVariable Integer idGrupo) {
        try {
            List<NotasDeTareas> tareasGrupoNotas = entregaGrupalService.obtenerTareasNotasGrupos(idSeccion, idGrupo);
            return ResponseEntity.ok(tareasGrupoNotas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/tarea/{idTarea}/grupo/{idGrupo}/nota")
    public ResponseEntity<Object> actualizarNotaPorTareaYGrupo(@PathVariable Integer idTarea,
                                                               @PathVariable Integer idGrupo,
                                                               @RequestBody ActualizarNotaRequest req) {
        try {
            entregaGrupalService.actualizarNotaPorTareaYGrupo(idTarea, idGrupo, req.getNota());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ErrorConstants.ERROR_KEY, e.getMessage()));
        }
    }

    @GetMapping("/grupo/{idGrupo}/integrantes")
    public ResponseEntity<List<IntegranteGrupoDTO>> obtenerIntegrantesGrupo(@PathVariable Integer idGrupo) {
        try {
            List<IntegranteGrupoDTO> integrantes = entregaGrupalService.obtenerIntegrantesGrupo(idGrupo);
            return ResponseEntity.ok(integrantes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}