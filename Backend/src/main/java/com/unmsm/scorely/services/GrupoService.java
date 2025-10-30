package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.AlumnoDTO;
import com.unmsm.scorely.dto.CrearGrupoRequest;
import com.unmsm.scorely.dto.CrearGrupoResponse;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.repository.GrupoRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final AlumnoSeccionRepository alumnoSeccionRepository;
    private final SeccionRepository seccionRepository;

    public GrupoService(GrupoRepository grupoRepository,
                        AlumnoSeccionRepository alumnoSeccionRepository,
                        SeccionRepository seccionRepository) {
        this.grupoRepository = grupoRepository;
        this.alumnoSeccionRepository = alumnoSeccionRepository;
        this.seccionRepository = seccionRepository;
    }

    /**
     * Obtiene la lista de alumnos disponibles (sin grupo) de una sección
     */
    public List<AlumnoDTO> getAlumnosDisponiblesBySeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones =
                alumnoSeccionRepository.findAlumnosSinGrupoBySeccion(idSeccion);

        return alumnosSecciones.stream()
                .map(this::convertToAlumnoDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los alumnos de una sección (con y sin grupo)
     */
    public List<AlumnoDTO> getAllAlumnosBySeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones =
                alumnoSeccionRepository.findAllBySeccionWithGrupo(idSeccion);

        return alumnosSecciones.stream()
                .map(this::convertToAlumnoDTOWithGrupo)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo grupo con los alumnos seleccionados
     */
    @Transactional
    public CrearGrupoResponse crearGrupo(CrearGrupoRequest request) {
        // Validar que la sección existe
        Seccion seccion = seccionRepository.findById(request.getSeccionId())
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));

        // Validar que se seleccionaron al menos 2 alumnos
        if (request.getAlumnoIds() == null || request.getAlumnoIds().size() < 2) {
            throw new RuntimeException("Debe seleccionar al menos 2 alumnos para crear un grupo");
        }


        // Validar que ningún alumno ya tiene grupo asignado
        for (Integer idAlumno : request.getAlumnoIds()) {
            if (alumnoSeccionRepository.alumnoTieneGrupo(idAlumno, request.getSeccionId())) {
                throw new RuntimeException("Uno o más alumnos ya pertenecen a un grupo");
            }
        }

        // Crear el grupo
        Grupo grupo = new Grupo();
        grupo.setNombreGrupo(request.getNombreGrupo());
        grupo.setSeccion(seccion);
        grupo = grupoRepository.save(grupo);

        // Lista para almacenar los alumnos del grupo
        List<AlumnoDTO> alumnosDelGrupo = new ArrayList<>();

        // Asignar el grupo a los alumnos en AlumnoSeccion
        for (Integer idAlumno : request.getAlumnoIds()) {
            AlumnoSeccion alumnoSeccion = alumnoSeccionRepository
                    .findByAlumnoAndSeccion(idAlumno, request.getSeccionId())
                    .orElseThrow(() -> new RuntimeException("Alumno con ID " + idAlumno + " no encontrado en la sección"));

            alumnoSeccion.setGrupo(grupo);
            alumnoSeccionRepository.save(alumnoSeccion);

            // Agregar alumno a la lista de respuesta
            alumnosDelGrupo.add(convertToAlumnoDTO(alumnoSeccion));
        }

        // Retornar la respuesta completa
        CrearGrupoResponse resp = new CrearGrupoResponse();
        resp.setIdGrupo(grupo.getIdGrupo());
        resp.setNombreGrupo(grupo.getNombreGrupo());
        resp.setPromedioFinal(grupo.getPromedioFinal());
        resp.setSeccionId(request.getSeccionId());
        resp.setAlumnos(alumnosDelGrupo);
        resp.setCantidadAlumnos(alumnosDelGrupo.size());
        return resp;
    }



    // Métodos auxiliares de conversión

    private AlumnoDTO convertToAlumnoDTO(AlumnoSeccion alumnoSeccion) {
        Alumno alumno = alumnoSeccion.getAlumno();
        Persona persona = alumno.getPersona();

        String nombreCompleto = (persona != null ? persona.getNombres() : "") + (persona != null && persona.getApellidoP() != null ? " " + persona.getApellidoP() : "") + (persona != null && persona.getApellidoM() != null ? " " + persona.getApellidoM() : "");

        AlumnoDTO dto = new AlumnoDTO();
        dto.setIdAlumno(alumno.getIdAlumno());
        dto.setNombreCompleto(nombreCompleto.trim());
        dto.setCodigoAlumno(alumno.getCodigoAlumno());
        return dto;
    }

    private AlumnoDTO convertToAlumnoDTOWithGrupo(AlumnoSeccion alumnoSeccion) {
        Alumno alumno = alumnoSeccion.getAlumno();
        Persona persona = alumno.getPersona();
        Grupo grupo = alumnoSeccion.getGrupo();

        String nombreCompleto = (persona != null ? persona.getNombres() : "") + (persona != null && persona.getApellidoP() != null ? " " + persona.getApellidoP() : "") + (persona != null && persona.getApellidoM() != null ? " " + persona.getApellidoM() : "");

        AlumnoDTO dto = new AlumnoDTO();
        dto.setIdAlumno(alumno.getIdAlumno());
        dto.setNombreCompleto(nombreCompleto.trim());
        dto.setCodigoAlumno(alumno.getCodigoAlumno());
        dto.setIdGrupo(grupo != null ? grupo.getIdGrupo() : null);
        dto.setNombreGrupo(grupo != null ? grupo.getNombreGrupo() : null);
        return dto;
    }

    private CrearGrupoResponse convertToCrearGrupoResponse(Grupo grupo) {
        // Obtener alumnos del grupo desde AlumnoSeccion
        List<AlumnoSeccion> alumnosSecciones = alumnoSeccionRepository
                .findAllBySeccionWithGrupo(grupo.getSeccion().getIdSeccion())
                .stream()
                .filter(as -> as.getGrupo() != null &&
                        as.getGrupo().getIdGrupo().equals(grupo.getIdGrupo()))
                .collect(Collectors.toList());

        List<AlumnoDTO> alumnosDTO = alumnosSecciones.stream()
                .map(this::convertToAlumnoDTO)
                .collect(Collectors.toList());

        CrearGrupoResponse r = new CrearGrupoResponse();
        r.setIdGrupo(grupo.getIdGrupo());
        r.setNombreGrupo(grupo.getNombreGrupo());
        r.setPromedioFinal(grupo.getPromedioFinal());
        r.setSeccionId(grupo.getSeccion().getIdSeccion());
        r.setAlumnos(alumnosDTO);
        r.setCantidadAlumnos(alumnosDTO.size());
        return r;
    }
}