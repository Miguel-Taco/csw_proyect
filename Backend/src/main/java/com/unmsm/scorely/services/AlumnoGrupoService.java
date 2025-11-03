package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.GrupoInfoAlumnoDTO;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.repository.EntregaGrupalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoGrupoService {

    private final AlumnoSeccionRepository alumnoSeccionRepository;
    private final EntregaGrupalRepository entregaGrupalRepository;

    /**
     * Obtiene la información del grupo al que pertenece un alumno en una sección
     */
    public GrupoInfoAlumnoDTO getGrupoInfoByAlumnoAndSeccion(Integer idAlumno, Integer idSeccion) {
        // Buscar el registro de AlumnoSeccion
        AlumnoSeccion alumnoSeccion = alumnoSeccionRepository
                .findByAlumnoAndSeccion(idAlumno, idSeccion)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado en la sección"));

        // Verificar que el alumno tenga un grupo asignado
        Grupo grupo = alumnoSeccion.getGrupo();
        if (grupo == null) {
            return null; // El alumno no pertenece a ningún grupo
        }

        // Construir el DTO de respuesta
        GrupoInfoAlumnoDTO dto = new GrupoInfoAlumnoDTO();
        dto.setIdGrupo(grupo.getIdGrupo());
        dto.setNombreGrupo(grupo.getNombreGrupo());
        dto.setPromedioFinal(grupo.getPromedioFinal());
        dto.setNombreSeccion(grupo.getSeccion().getNombreCurso());

        // Obtener todos los integrantes del grupo
        List<AlumnoSeccion> integrantesAS = alumnoSeccionRepository
                .findAllBySeccionWithGrupo(idSeccion)
                .stream()
                .filter(as -> as.getGrupo() != null &&
                        as.getGrupo().getIdGrupo().equals(grupo.getIdGrupo()))
                .collect(Collectors.toList());

        // Convertir a IntegranteDTO
        List<GrupoInfoAlumnoDTO.IntegranteDTO> integrantes = integrantesAS.stream()
                .map(this::convertToIntegranteDTO)
                .collect(Collectors.toList());

        dto.setIntegrantes(integrantes);
        dto.setCantidadIntegrantes(integrantes.size());

        // Obtener entregas grupales
        List<EntregaGrupal> entregasGrupales = entregaGrupalRepository.findByGrupo_IdGrupo(grupo.getIdGrupo());

        List<GrupoInfoAlumnoDTO.TareaGrupalDTO> tareas = entregasGrupales.stream()
                .map(this::convertToTareaGrupalDTO)
                .collect(Collectors.toList());

        dto.setTareas(tareas);
        dto.setTotalTareas(tareas.size());

        // Calcular promedio actual
        Double promedioActual = calcularPromedioActual(entregasGrupales);
        dto.setPromedioActual(promedioActual);

        return dto;
    }

    // Métodos auxiliares

    private GrupoInfoAlumnoDTO.IntegranteDTO convertToIntegranteDTO(AlumnoSeccion alumnoSeccion) {
        Alumno alumno = alumnoSeccion.getAlumno();
        Persona persona = alumno.getPersona();

        String nombreCompleto = String.format("%s %s %s",
                persona.getNombres(),
                persona.getApellidoP() != null ? persona.getApellidoP() : "",
                persona.getApellidoM() != null ? persona.getApellidoM() : ""
        ).trim();

        return new GrupoInfoAlumnoDTO.IntegranteDTO(
                alumno.getIdAlumno(),
                nombreCompleto,
                alumno.getCodigoAlumno()
        );
    }

    private GrupoInfoAlumnoDTO.TareaGrupalDTO convertToTareaGrupalDTO(EntregaGrupal entregaGrupal) {
        Entrega entrega = entregaGrupal.getEntrega();
        Tarea tarea = entrega.getTarea();

        String fechaEntrega = null;
        if (entrega.getFechaEntrega() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            fechaEntrega = entrega.getFechaEntrega().format(formatter);
        }

        // Convertir BigDecimal a Double
        Double nota = null;
        if (entrega.getNota() != null) {
            nota = entrega.getNota().doubleValue();
        }

        return new GrupoInfoAlumnoDTO.TareaGrupalDTO(
                tarea.getIdTarea(),
                tarea.getNombre(),
                nota,
                fechaEntrega
        );
    }

    private Double calcularPromedioActual(List<EntregaGrupal> entregasGrupales) {
        List<BigDecimal> notasValidas = entregasGrupales.stream()
                .map(EntregaGrupal::getEntrega)
                .map(Entrega::getNota)
                .filter(nota -> nota != null && nota.compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        if (notasValidas.isEmpty()) {
            return null;
        }

        BigDecimal suma = notasValidas.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal promedio = suma.divide(
                BigDecimal.valueOf(notasValidas.size()),
                2,
                BigDecimal.ROUND_HALF_UP
        );

        return promedio.doubleValue();
    }
}