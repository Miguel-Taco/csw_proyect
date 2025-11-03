package com.unmsm.scorely.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unmsm.scorely.dto.AlumnoSeccionDTO;
import com.unmsm.scorely.models.AlumnoSeccion;
import com.unmsm.scorely.models.Entrega;
import com.unmsm.scorely.models.Persona;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.repository.EntregaRepository;

@Service
public class AlumnoSeccionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AlumnoSeccionService.class);

    private final AlumnoSeccionRepository alumnoSeccionRepository;
    private final EntregaRepository entregaRepository;

    public AlumnoSeccionService(
            AlumnoSeccionRepository alumnoSeccionRepository,
            EntregaRepository entregaRepository
    ) {
        this.alumnoSeccionRepository = alumnoSeccionRepository;
        this.entregaRepository = entregaRepository;
    }

    @Transactional(readOnly = true)
    public List<AlumnoSeccionDTO> obtenerAlumnosPorSeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones = alumnoSeccionRepository
                .findBySeccion_IdSeccion(idSeccion);

        return alumnosSecciones.stream()
                .map(alumnoSeccion -> convertirADTO(alumnoSeccion, idSeccion))
                .toList();
    }

    @Transactional(readOnly = true)
    public AlumnoSeccionDTO obtenerAlumnoEnSeccion(Integer idSeccion, Integer idAlumno) {
        AlumnoSeccion alumnoSeccion = alumnoSeccionRepository
                .findByAlumnoAndSeccion(idAlumno, idSeccion)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado en la sección"));

        return convertirADTO(alumnoSeccion, idSeccion);
    }

    private AlumnoSeccionDTO convertirADTO(AlumnoSeccion alumnoSeccion, Integer idSeccion) {
        Persona persona = alumnoSeccion.getAlumno().getPersona();

        String nombreCompleto = String.format("%s %s %s",
                persona.getNombres(),
                persona.getApellidoP(),
                persona.getApellidoM()).trim();

        BigDecimal promedio = calcularPromedio(alumnoSeccion.getAlumno().getIdAlumno(), idSeccion);

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

    /**
     * Calcula el promedio de un alumno en una sección basándose en sus entregas.
     * Solo considera la entrega más reciente de cada tarea.
     */
    private BigDecimal calcularPromedio(Integer idAlumno, Integer idSeccion) {
        try {
            List<Integer> tareasIds = entregaRepository.findTareasIdsBySeccion(idSeccion);

            if (tareasIds.isEmpty()) {
                return null;
            }

            BigDecimal sumaNotas = BigDecimal.ZERO;
            int cantidadNotasValidas = 0;

            for (Integer idTarea : tareasIds) {
                List<Entrega> entregas = entregaRepository
                        .findByTareaAndAlumnoOrderByFechaDesc(idTarea, idAlumno);

                if (!entregas.isEmpty()) {
                    Entrega ultimaEntrega = entregas.get(0);
                    if (ultimaEntrega.getNota() != null) {
                        sumaNotas = sumaNotas.add(ultimaEntrega.getNota());
                        cantidadNotasValidas++;
                    }
                }
            }

            if (cantidadNotasValidas == 0) {
                return null;
            }

            return sumaNotas.divide(BigDecimal.valueOf(cantidadNotasValidas), 2, RoundingMode.HALF_UP);

        } catch (Exception e) {
            LOGGER.error("Error al calcular promedio: {}", e.getMessage(), e);
            return null;
        }
    }
}
