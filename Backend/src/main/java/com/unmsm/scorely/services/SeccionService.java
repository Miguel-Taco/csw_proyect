package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.CrearSeccionRequest;
import com.unmsm.scorely.dto.SeccionAlumnoDTO;
import com.unmsm.scorely.dto.SeccionDTO;
import com.unmsm.scorely.dto.EditarSeccionRequest;
import com.unmsm.scorely.models.Profesor;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.ProfesorRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class SeccionService {
    @Autowired
    private final SeccionRepository seccionRepository;

    @Autowired
    private ProfesorRepository profesorRepository;

    public SeccionService(SeccionRepository seccionRepository) {
        this.seccionRepository = seccionRepository;
    }

    // Obtener todas las secciones de un profesor
    public List<Seccion> obtenerSeccionesPorProfesor(Integer idProfesor) {
        try {
            List<Seccion> secciones = seccionRepository.findByProfesor_IdProfesor(idProfesor);
            return secciones != null ? secciones : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("Error al obtener secciones: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<SeccionDTO> obtenerSeccionesPorProfesorYAnio(Integer idProfesor, Integer anio) {
        // 1. Llama al repositorio. Spring Data JPA se encarga de todo.
        List<Seccion> secciones = seccionRepository.findByProfesor_IdProfesorAndAnio(idProfesor, anio);

        // 2. Convierte la lista de entidades a una lista de DTOs y la devuelve.
        return secciones.stream()
                .map(this::convertirASeccionDto)
                .collect(Collectors.toList());
    }

    // Asegúrate de tener este método de ayuda en la misma clase
    private SeccionDTO convertirASeccionDto(Seccion seccion) {
        SeccionDTO dto = new SeccionDTO();
        dto.setIdSeccion(seccion.getIdSeccion());
        dto.setNombreCurso(seccion.getNombreCurso());
        dto.setAnio(seccion.getAnio());
        dto.setCodigo(seccion.getCodigo());
        dto.setId_profesor(seccion.getProfesor().getIdProfesor());
        return dto;
    }



    // Crear nueva sección
    @Transactional
    public Seccion crearSeccion(CrearSeccionRequest request) {
        // PASO 1: Busca la entidad del Profesor usando el ID que viene en el DTO.
        // Si no lo encuentra, lanza una excepción clara.
        Profesor profesorAsociado = profesorRepository.findById(request.getId_profesor())
                .orElseThrow(() -> new RuntimeException("Error: No se encontró un profesor con el ID: " + request.getId_profesor()));

        // PASO 2: Crea la nueva instancia de la entidad Seccion
        Seccion nuevaSeccion = new Seccion();

        // PASO 3: Asigna el objeto Profesor COMPLETO a la nueva sección.
        // ¡ESTA ES LA LÍNEA CLAVE QUE FALTABA!
        nuevaSeccion.setProfesor(profesorAsociado);

        // PASO 4: Mapea el resto de los datos del DTO a la entidad
        nuevaSeccion.setNombreCurso(request.getNombreCurso());
        nuevaSeccion.setAnio(request.getAnio());
        nuevaSeccion.setCodigo(request.getCodigo());

        // PASO 5: Guarda la entidad Seccion ya completa y correctamente asociada
        return seccionRepository.save(nuevaSeccion);
    }
    
    // Método para editar sección
@Transactional
public SeccionDTO editarSeccion(Integer idSeccion, Integer idProfesor, EditarSeccionRequest request) {
    // Verificar que la sección existe y pertenece al profesor
    Seccion seccion = seccionRepository.findById(idSeccion)
            .orElseThrow(() -> new RuntimeException("Sección no encontrada"));

    if (!seccion.getProfesor().getIdProfesor().equals(idProfesor)) {
        throw new RuntimeException("No tiene permisos para editar esta sección");
    }

    // Validar duplicados
    List<Seccion> seccionesExistentes = seccionRepository
            .findByProfesor_IdProfesorAndAnio(idProfesor, request.getAnio());

    for (Seccion s : seccionesExistentes) {
        if (s.getNombreCurso().equalsIgnoreCase(request.getNombreCurso()) 
            && !s.getIdSeccion().equals(idSeccion)) {
            throw new RuntimeException("Ya existe una sección con ese nombre en el año " + request.getAnio());
        }
    }

    // Actualizar
    seccion.setNombreCurso(request.getNombreCurso());
    seccion.setAnio(request.getAnio());

    Seccion actualizada = seccionRepository.save(seccion);

    SeccionDTO dto = new SeccionDTO();
    dto.setIdSeccion(actualizada.getIdSeccion());
    dto.setNombreCurso(actualizada.getNombreCurso());
    dto.setAnio(actualizada.getAnio());
    dto.setCodigo(actualizada.getCodigo());
    dto.setId_profesor(actualizada.getProfesor().getIdProfesor());

    return dto;
}
    
    // Eliminar sección (solo si pertenece al profesor)
    @Transactional
    public boolean eliminarSeccion(Integer idSeccion, Integer idProfesor) {
        // Verificar que la sección pertenece al profesor
        if (!seccionRepository.existsByIdSeccionAndProfesor_IdProfesor(idSeccion, idProfesor)) {
            return false; // No tiene permiso
        }
        
        // Verificar que la sección existe
        Optional<Seccion> seccion = seccionRepository.findById(idSeccion);
        if (seccion.isEmpty()) {
            return false;
        }
        
        // Eliminar la sección
        seccionRepository.deleteById(idSeccion);
        return true;
    }

    // Obtener una sección por ID
    public Optional<Seccion> obtenerSeccionPorId(Integer idSeccion) {
        return seccionRepository.findById(idSeccion);
    }

    public List<SeccionAlumnoDTO> obtenerSeccionesPorAlumnoYAnio(Integer idAlumno, Integer anio) {
        // Aquí deberías hacer un JOIN entre Alumno_Seccion, Seccion y Profesor
        // Por ahora, asumo que obtienes las secciones del alumno

        List<Seccion> secciones = seccionRepository.findByAlumnoAndAnio(idAlumno, anio);

        return secciones.stream()
                .map(this::convertirASeccionConProfesorDto)
                .collect(Collectors.toList());
    }

    private SeccionAlumnoDTO convertirASeccionConProfesorDto(Seccion seccion) {
        SeccionAlumnoDTO dto = new SeccionAlumnoDTO();
        dto.setIdSeccion(seccion.getIdSeccion());
        dto.setNombreCurso(seccion.getNombreCurso());
        dto.setAnio(seccion.getAnio());
        dto.setCodigo(seccion.getCodigo());
        dto.setId_profesor(seccion.getProfesor().getIdProfesor());

        // Construir nombre completo del profesor
        Profesor profesor = seccion.getProfesor();
        String nombreCompleto = profesor.getPersona().getNombres() + " " +
                profesor.getPersona().getApellidoP() + " " +
                profesor.getPersona().getApellidoM();
        dto.setNombreProfesor(nombreCompleto);

        return dto;
    }
}