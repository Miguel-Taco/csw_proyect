package com.unmsm.scorely.controllers;


import com.unmsm.scorely.models.Tarea;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/tareasALumnos")
@CrossOrigin(origins = "*")
public class NotasController {

    //Listar las notas individuales de los alumnos por seccion
    @GetMapping("/aLumno")
    public ResponseEntity<List<Tarea>> obtenerNotasAlumnoIndividual(@PathVariable Integer idAlumno){

        return null;
    }

}
