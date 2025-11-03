package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.AlumnoDTO;
import com.unmsm.scorely.dto.CrearGrupoResponse;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.repository.GrupoRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // ✅ Import correcto

import java.util.List;

@Service
public class GrupoSeccionService {

    private final GrupoRepository grupoRepository;
    private final SeccionRepository seccionRepository;
    private final AlumnoSeccionRepository alumnoSeccionRepository;

    public GrupoSeccionService(
            GrupoRepository grupoRepository,
            SeccionRepository seccionRepository,
            AlumnoSeccionRepository alumnoSeccionRepository
    ) {
        this.grupoRepository = grupoRepository;
        this.seccionRepository = seccionRepository;
        this.alumnoSeccionRepository = alumnoSeccionRepository;
    }

    // ✅ Ahora el atributo readOnly funciona correctamente
    @Transactional(readOnly = true)
    public List<CrearGrupoResponse> obtenerGruposPorSeccion(Integer idSeccion) {
        // Verificar que la sección exista
        seccionRepository.findById(idSeccion)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));

        // Obtener los grupos de la sección
        List<Grupo> grupos = grupoRepository.findGruposBySeccion(idSeccion);

        // Convertir los grupos a DTOs
        return grupos.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    private CrearGrupoResponse convertToResponseDTO(Grupo grupo) {
        // Obtener alumnos del grupo específico
        List<AlumnoSeccion> alumnosSecciones = alumnoSeccionRepository
                .findAllBySeccionWithGrupo(grupo.getSeccion().getIdSeccion())
                .stream()
                .filter(as -> as.getGrupo() != null &&
                        as.getGrupo().getIdGrupo().equals(grupo.getIdGrupo()))
                .toList();

        // Convertir alumnos a DTOs
        List<AlumnoDTO> alumnosDTO = alumnosSecciones.stream()
                .map(this::convertToAlumnoDTO)
                .toList();

        // Construir la respuesta
        CrearGrupoResponse response = new CrearGrupoResponse();
        response.setIdGrupo(grupo.getIdGrupo());
        response.setNombreGrupo(grupo.getNombreGrupo());
        response.setPromedioFinal(grupo.getPromedioFinal());
        response.setSeccionId(grupo.getSeccion().getIdSeccion());
        response.setAlumnos(alumnosDTO);
        response.setCantidadAlumnos(alumnosDTO.size());

        return response;
    }

    private AlumnoDTO convertToAlumnoDTO(AlumnoSeccion alumnoSeccion) {
        Alumno alumno = alumnoSeccion.getAlumno();
        Persona persona = alumno.getPersona();

        String nombreCompleto = (persona != null ? persona.getNombres() : "") +
                (persona != null && persona.getApellidoP() != null ? " " + persona.getApellidoP() : "") +
                (persona != null && persona.getApellidoM() != null ? " " + persona.getApellidoM() : "");

        AlumnoDTO dto = new AlumnoDTO();
        dto.setIdAlumno(alumno.getIdAlumno());
        dto.setNombreCompleto(nombreCompleto.trim());
        dto.setCodigoAlumno(alumno.getCodigoAlumno());
        return dto;
    }
}
