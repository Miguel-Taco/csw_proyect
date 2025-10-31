package com.unmsm.scorely.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unmsm.scorely.dto.AlumnoSeccionDTO;
import com.unmsm.scorely.services.AlumnoSeccionService;

@RestController
@RequestMapping("/api/alumnos-seccion")
@CrossOrigin(origins = "http://localhost:3000")
public class AlumnoSeccionController {

    private final AlumnoSeccionService alumnoSeccionService;

    public AlumnoSeccionController(AlumnoSeccionService alumnoSeccionService) {
        this.alumnoSeccionService = alumnoSeccionService;
    }

    // Obtener todos los alumnos de una sección con su promedio
    @GetMapping("/seccion/{idSeccion}")
    public ResponseEntity<List<AlumnoSeccionDTO>> obtenerAlumnosPorSeccion(
            @PathVariable Integer idSeccion) {
        List<AlumnoSeccionDTO> alumnos = alumnoSeccionService.obtenerAlumnosPorSeccion(idSeccion);
        return ResponseEntity.ok(alumnos);
    }

    // Obtener información específica de un alumno en una sección
    @GetMapping("/seccion/{idSeccion}/alumno/{idAlumno}")
    public ResponseEntity<AlumnoSeccionDTO> obtenerAlumnoEnSeccion(
            @PathVariable Integer idSeccion,
            @PathVariable Integer idAlumno) {
        AlumnoSeccionDTO alumno = alumnoSeccionService.obtenerAlumnoEnSeccion(idSeccion, idAlumno);
        return ResponseEntity.ok(alumno);
    }
}
