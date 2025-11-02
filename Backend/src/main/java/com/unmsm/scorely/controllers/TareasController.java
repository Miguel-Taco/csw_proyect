package com.unmsm.scorely.controllers;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unmsm.scorely.models.Tarea;

@RestController
@RequestMapping("api/tareasALumnos")
@CrossOrigin(origins = "http://localhost:3000")
public class TareasController {

    //Listar las notas individuales de los alumnos por seccion
    @GetMapping("/alumno/{idAlumno}")
    public ResponseEntity<List<Tarea>> obtenerNotasAlumnoIndividual(@PathVariable Integer idAlumno) {
        return null;
    }    

}
