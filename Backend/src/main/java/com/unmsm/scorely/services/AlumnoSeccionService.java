package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.AlumnoSeccionDTO;
import com.unmsm.scorely.models.AlumnoSeccion;
import com.unmsm.scorely.models.Persona;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlumnoSeccionService {

    private final AlumnoSeccionRepository alumnoSeccionRepository;

    public AlumnoSeccionService(AlumnoSeccionRepository alumnoSeccionRepository) {
        this.alumnoSeccionRepository = alumnoSeccionRepository;
    }

    @Transactional(readOnly = true)
    public List<AlumnoSeccionDTO> obtenerAlumnosPorSeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones = alumnoSeccionRepository
                .findBySeccion_IdSeccion(idSeccion);

        return alumnosSecciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlumnoSeccionDTO obtenerAlumnoEnSeccion(Integer idSeccion, Integer idAlumno) {
        AlumnoSeccion alumnoSeccion = alumnoSeccionRepository
                .findByAlumnoAndSeccion(idAlumno, idSeccion)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado en la sección"));

        return convertirADTO(alumnoSeccion);
    }

    private AlumnoSeccionDTO convertirADTO(AlumnoSeccion alumnoSeccion) {
        Persona persona = alumnoSeccion.getAlumno().getPersona();
        
        String nombreCompleto = String.format("%s %s %s",
                persona.getNombres(),
                persona.getApellidoP(),
                persona.getApellidoM()).trim();

        // Por ahora el promedio es null, se calculará cuando implementes las notas
        BigDecimal promedio = calcularPromedio(alumnoSeccion);

        return AlumnoSeccionDTO.builder()
                .idAlumno(alumnoSeccion.getAlumno().getIdAlumno())
                .idPersona(persona.getIdPersona())
                .nombreCompleto(nombreCompleto)
                .nombres(persona.getNombres())
                .apellidoPaterno(persona.getApellidoP())
                .apellidoMaterno(persona.getApellidoM())
                .correo(persona.getCorreo())
                .codigoAlumno(alumnoSeccion.getAlumno().getCodigoAlumno())
                .promedioFinal(promedio)
                .idSeccion(alumnoSeccion.getSeccion().getIdSeccion())
                .nombreCurso(alumnoSeccion.getSeccion().getNombreCurso())
                .build();
    }

    private BigDecimal calcularPromedio(AlumnoSeccion alumnoSeccion) {
        // TODO: Implementar cálculo real de promedio basado en entregas
        // Por ahora retorna null o un valor de ejemplo
        return null;
    }
}
