package com.unmsm.scorely.services;

import com.unmsm.scorely.models.Alumno;
import com.unmsm.scorely.models.Seccion;

public interface MatriculaService {
    boolean estaMatriculado(Alumno alumno, Seccion seccion);
    void matricularAlumno(Alumno alumno, Seccion seccion);
}
