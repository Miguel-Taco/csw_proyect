package com.unmsm.scorely.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unmsm.scorely.dto.GrupoSeccionDTO;
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
    public ResponseEntity<List<GrupoSeccionDTO>> obtenerGruposPorSeccion(
            @PathVariable Integer idSeccion) {
        List<GrupoSeccionDTO> grupos = grupoSeccionService.obtenerGruposPorSeccion(idSeccion);
        return ResponseEntity.ok(grupos);
    }

    // Obtener información específica de un grupo en una sección
    @GetMapping("/seccion/{idSeccion}/grupo/{idGrupo}")
    public ResponseEntity<GrupoSeccionDTO> obtenerGrupoEnSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idGrupo) {
        GrupoSeccionDTO grupo = grupoSeccionService.obtenerGrupoEnSeccion(idSeccion, idGrupo);
        return ResponseEntity.ok(grupo);
    }
}
