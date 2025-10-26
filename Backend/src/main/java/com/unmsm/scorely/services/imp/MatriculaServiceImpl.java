package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.models.Alumno;
import com.unmsm.scorely.models.AlumnoSeccion;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.services.MatriculaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class MatriculaServiceImpl implements MatriculaService {
    private final AlumnoSeccionRepository alumnoSeccionRepository;

    public MatriculaServiceImpl(AlumnoSeccionRepository alumnoSeccionRepository) {
        this.alumnoSeccionRepository = alumnoSeccionRepository;
    }

    @Override
    public boolean estaMatriculado(Alumno alumno, Seccion seccion) {
        return alumnoSeccionRepository.existsByAlumnoAndSeccion(
                alumno.getIdAlumno(),
                seccion.getIdSeccion()
        );
    }

    @Override
    @Transactional
    public void matricularAlumno(Alumno alumno, Seccion seccion) {
        AlumnoSeccion alumnoSeccion = AlumnoSeccion.builder()
                .alumno(alumno)
                .seccion(seccion)
                .build();

        alumnoSeccionRepository.save(alumnoSeccion);
        log.info("Alumno {} matriculado en sección {}", alumno.getIdAlumno(), seccion.getIdSeccion());
    }
}
