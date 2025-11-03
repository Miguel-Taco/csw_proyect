package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.AlumnoDTO;
import com.unmsm.scorely.dto.CrearGrupoRequest;
import com.unmsm.scorely.dto.CrearGrupoResponse;
import com.unmsm.scorely.dto.ObtenerCompanerosResponse;
import com.unmsm.scorely.exception.GrupoServiceException;
import com.unmsm.scorely.models.Alumno;
import com.unmsm.scorely.models.AlumnoSeccion;
import com.unmsm.scorely.models.Grupo;
import com.unmsm.scorely.models.Persona;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import com.unmsm.scorely.repository.GrupoRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    /* =========================
       🔎 Consultas (read-only)
       ========================= */

    /**
     * GET: lista todos los grupos como CrearGrupoResponse (id, nombre, sección, alumnos, etc.)
     */
    @Transactional(readOnly = true)
    public List<CrearGrupoResponse> listarGrupos() {
        List<Grupo> grupos = grupoRepository.findAll();
        List<CrearGrupoResponse> out = new ArrayList<>(grupos.size());
        for (Grupo g : grupos) {
            out.add(convertToCrearGrupoResponse(g));
        }
        return out;
    }

    /**
     * GET: obtiene un grupo por id como CrearGrupoResponse
     */
    @Transactional(readOnly = true)
    public Optional<CrearGrupoResponse> obtenerGrupoPorId(Integer idGrupo) {
        return grupoRepository.findById(idGrupo)
                .map(this::convertToCrearGrupoResponse);
    }

    /**
     * Obtiene la lista de alumnos disponibles (sin grupo) de una sección
     */
    @Transactional(readOnly = true)
    public List<AlumnoDTO> getAlumnosDisponiblesBySeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones =
                alumnoSeccionRepository.findAlumnosSinGrupoBySeccion(idSeccion);

        return alumnosSecciones.stream()
                .map(this::convertToAlumnoDTO)
                .toList();
    }

    /**
     * Obtiene todos los alumnos de una sección (con y sin grupo)
     */
    @Transactional(readOnly = true)
    public List<AlumnoDTO> getAllAlumnosBySeccion(Integer idSeccion) {
        List<AlumnoSeccion> alumnosSecciones =
                alumnoSeccionRepository.findAllBySeccionWithGrupo(idSeccion);

        return alumnosSecciones.stream()
                .map(this::convertToAlumnoDTOWithGrupo)
                .toList();
    }

    /* =========================
       ✍️ Comandos (write)
       ========================= */

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
            throw new GrupoServiceException("Debe seleccionar al menos 2 alumnos para crear un grupo");
        }

        // Validar que ningún alumno ya tiene grupo asignado
        for (Integer idAlumno : request.getAlumnoIds()) {
            if (alumnoSeccionRepository.alumnoTieneGrupo(idAlumno, request.getSeccionId())) {
                throw new GrupoServiceException("Uno o más alumnos ya pertenecen a un grupo");
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

    /**
     * Modifica un grupo existente y sus miembros
     */
    @Transactional
    public CrearGrupoResponse modificarGrupo(Integer idGrupo, CrearGrupoRequest request) {
        // 1. Validar que el grupo existe
        Grupo grupo = grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado con ID: " + idGrupo));

        // 2. Validar que la sección existe
        Seccion seccion = seccionRepository.findById(request.getSeccionId())
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));

        // Validar que se seleccionaron al menos 2 alumnos
        if (request.getAlumnoIds() == null || request.getAlumnoIds().size() < 2) {
            throw new GrupoServiceException("Debe seleccionar al menos 2 alumnos para un grupo");
        }

        // 3. Validar que los alumnos seleccionados no pertenecen a *otro* grupo
        for (Integer idAlumno : request.getAlumnoIds()) {
            AlumnoSeccion as = alumnoSeccionRepository
                    .findByAlumnoAndSeccion(idAlumno, request.getSeccionId())
                    .orElse(null);

            if (as != null && as.getGrupo() != null && !as.getGrupo().getIdGrupo().equals(idGrupo)) {
                throw new GrupoServiceException("El alumno con ID " + idAlumno + " ya pertenece a otro grupo.");
            }
        }

        // 4. Desvincular alumnos antiguos del grupo
        List<AlumnoSeccion> alumnosActuales = alumnoSeccionRepository
                .findAllBySeccionWithGrupo(grupo.getSeccion().getIdSeccion())
                .stream()
                .filter(as -> as.getGrupo() != null && as.getGrupo().getIdGrupo().equals(idGrupo))
                .toList();

        for (AlumnoSeccion as : alumnosActuales) {
            as.setGrupo(null);
            alumnoSeccionRepository.save(as);
        }

        // 5. Actualizar nombre del grupo
        grupo.setNombreGrupo(request.getNombreGrupo());
        grupo = grupoRepository.save(grupo);

        // 6. Vincular a los nuevos alumnos
        List<AlumnoDTO> alumnosDelGrupo = new ArrayList<>();

        for (Integer idAlumno : request.getAlumnoIds()) {
            AlumnoSeccion alumnoSeccion = alumnoSeccionRepository
                    .findByAlumnoAndSeccion(idAlumno, request.getSeccionId())
                    .orElseThrow(() -> new RuntimeException("Alumno con ID " + idAlumno + " no encontrado en la sección"));

            alumnoSeccion.setGrupo(grupo);
            alumnoSeccionRepository.save(alumnoSeccion);

            // Agregar alumno a la lista de respuesta
            alumnosDelGrupo.add(convertToAlumnoDTO(alumnoSeccion));
        }

        // 7. Retornar la respuesta actualizada
        CrearGrupoResponse resp = new CrearGrupoResponse();
        resp.setIdGrupo(grupo.getIdGrupo());
        resp.setNombreGrupo(grupo.getNombreGrupo());
        resp.setPromedioFinal(grupo.getPromedioFinal());
        resp.setSeccionId(request.getSeccionId());
        resp.setAlumnos(alumnosDelGrupo);
        resp.setCantidadAlumnos(alumnosDelGrupo.size());
        return resp;
    }

    /**
     * Elimina un grupo y desvincula a sus miembros
     */
    @Transactional
    public void eliminarGrupo(Integer idGrupo) {
        // 1. Validar que el grupo existe
        Grupo grupo = grupoRepository.findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo no encontrado con ID: " + idGrupo));

        // 2. Desvincular alumnos del grupo
        List<AlumnoSeccion> alumnosActuales = alumnoSeccionRepository
                .findAllBySeccionWithGrupo(grupo.getSeccion().getIdSeccion())
                .stream()
                .filter(as -> as.getGrupo() != null && as.getGrupo().getIdGrupo().equals(idGrupo))
                .toList();

        for (AlumnoSeccion as : alumnosActuales) {
            as.setGrupo(null);
            alumnoSeccionRepository.save(as);
        }

        // 3. Eliminar el grupo
        grupoRepository.delete(grupo);
    }

    /* =========================
       🔁 Helpers de conversión
       ========================= */

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

    private AlumnoDTO convertToAlumnoDTOWithGrupo(AlumnoSeccion alumnoSeccion) {
        Alumno alumno = alumnoSeccion.getAlumno();
        Persona persona = alumno.getPersona();
        Grupo grupo = alumnoSeccion.getGrupo();

        String nombreCompleto = (persona != null ? persona.getNombres() : "") +
                (persona != null && persona.getApellidoP() != null ? " " + persona.getApellidoP() : "") +
                (persona != null && persona.getApellidoM() != null ? " " + persona.getApellidoM() : "");

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
                .toList();

        List<AlumnoDTO> alumnosDTO = alumnosSecciones.stream()
                .map(this::convertToAlumnoDTO)
                .toList();

        CrearGrupoResponse r = new CrearGrupoResponse();
        r.setIdGrupo(grupo.getIdGrupo());
        r.setNombreGrupo(grupo.getNombreGrupo());
        r.setPromedioFinal(grupo.getPromedioFinal());
        r.setSeccionId(grupo.getSeccion().getIdSeccion());
        r.setAlumnos(alumnosDTO);
        r.setCantidadAlumnos(alumnosDTO.size());
        return r;
    }

    /* =========================
       👥 Compañeros
       ========================= */

    @Transactional(readOnly = true)
    public List<ObtenerCompanerosResponse> obtenerCompaneros(Integer idSeccion, Integer idPersona) {
        List<Object[]> resultados = grupoRepository.obtenerCompaneros(idSeccion, idPersona);

        List<ObtenerCompanerosResponse> companeros = new ArrayList<>();

        for (Object[] fila : resultados) {
            ObtenerCompanerosResponse dto = new ObtenerCompanerosResponse();
            dto.setNombres((String) fila[0]);
            dto.setApellido_p((String) fila[1]);
            dto.setApellido_m((String) fila[2]);
            dto.setPromedio_final(fila[3] != null ? ((Number) fila[3]).intValue() : null);
            companeros.add(dto);
        }

        return companeros;
    }
}
