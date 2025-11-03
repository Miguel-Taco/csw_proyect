package com.unmsm.scorely.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unmsm.scorely.dto.CrearGrupoResponse;
import com.unmsm.scorely.services.GrupoSeccionService;

@RestController
@RequestMapping("/api/grupos-seccion")
@CrossOrigin(origins = "http://localhost:3000")
public class GrupoSeccionController {

    private final GrupoSeccionService grupoSeccionService;

    public GrupoSeccionController(GrupoSeccionService grupoSeccionService) {
        this.grupoSeccionService = grupoSeccionService;
    }

    // Obtener todos los grupos de una sección
    @GetMapping("/seccion/{idSeccion}")
    public ResponseEntity<List<CrearGrupoResponse>> obtenerGruposPorSeccion(
            @PathVariable Integer idSeccion) {
        List<CrearGrupoResponse> grupos = grupoSeccionService.obtenerGruposPorSeccion(idSeccion);
        return ResponseEntity.ok(grupos);
    }

    // Obtener información específica de un grupo en una sección
    // NOTA: Necesitarás implementar este método en GrupoSeccionService
    @GetMapping("/seccion/{idSeccion}/grupo/{idGrupo}")
    public ResponseEntity<CrearGrupoResponse> obtenerGrupoEnSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idGrupo) {
        // Este método necesita ser implementado en GrupoSeccionService
        // Por ahora, puedes dejarlo comentado o implementarlo
        return ResponseEntity.notFound().build();
    }
}
