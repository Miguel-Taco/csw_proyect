package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.CrearSeccionRequest;
import com.unmsm.scorely.dto.SeccionAlumnoDTO;
import com.unmsm.scorely.dto.SeccionDTO;
import com.unmsm.scorely.dto.EditarSeccionRequest;
import com.unmsm.scorely.exception.SeccionServiceException;
import com.unmsm.scorely.models.Profesor;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.ProfesorRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Slf4j
@Service
public class SeccionService {
    private final SeccionRepository seccionRepository;

    private final ProfesorRepository profesorRepository;

    public SeccionService(SeccionRepository seccionRepository, ProfesorRepository profesorRepository) {
        this.seccionRepository = seccionRepository;
        this.profesorRepository = profesorRepository;
    }

    // Obtener todas las secciones de un profesor
    public List<Seccion> obtenerSeccionesPorProfesor(Integer idProfesor) {
        try {
            List<Seccion> secciones = seccionRepository.findByProfesor_IdProfesor(idProfesor);
            return secciones != null ? secciones : new ArrayList<>();
        } catch (Exception e) {
            log.error("Error al obtener secciones: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<SeccionDTO> obtenerSeccionesPorProfesorYAnio(Integer idProfesor, Integer anio) {
        List<Seccion> secciones = seccionRepository.findByProfesor_IdProfesorAndAnio(idProfesor, anio);

        // 2. Convierte la lista de entidades a una lista de DTOs y la devuelve.
        return secciones.stream()
                .map(this::convertirASeccionDto)
                .toList();
    }

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
        validarNombreCurso(request.getNombreCurso());
        validarAnio(request.getAnio());
        
        Profesor profesorAsociado = buscarProfesor(request.getId_profesor());
        
        validarSeccionDuplicada(profesorAsociado.getIdProfesor(), request.getNombreCurso(), request.getAnio());

        Seccion nuevaSeccion = construirSeccion(request, profesorAsociado);
        return seccionRepository.save(nuevaSeccion);
    }
    
    @Transactional
    public SeccionDTO editarSeccion(Integer idSeccion, Integer idProfesor, EditarSeccionRequest request) {
        validarNombreCurso(request.getNombreCurso());
        validarAnio(request.getAnio());
        
        Seccion seccion = obtenerSeccionConPermisos(idSeccion, idProfesor);
        
        validarSeccionDuplicadaParaEdicion(idProfesor, request.getNombreCurso(), request.getAnio(), idSeccion);

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
                .toList();
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
    
    // ==================== MÉTODOS PRIVADOS DE AYUDA ====================
    
    private void validarNombreCurso(String nombreCurso) {
        if (nombreCurso == null || nombreCurso.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del curso es obligatorio");
        }
    }
    
    private void validarAnio(Integer anio) {
        if (anio == null) {
            throw new IllegalArgumentException("El año es obligatorio");
        }
        if (anio < 2000) {
            throw new IllegalArgumentException("El año debe ser mayor o igual a 2000");
        }
    }
    
    private Profesor buscarProfesor(Integer idProfesor) {
        return profesorRepository.findById(idProfesor)
                .orElseThrow(() -> new RuntimeException("No se encontró un profesor con el ID: " + idProfesor));
    }
    
    private void validarSeccionDuplicada(Integer idProfesor, String nombreCurso, Integer anio) {
        List<Seccion> seccionesExistentes = seccionRepository.findByProfesor_IdProfesorAndAnio(idProfesor, anio);
        
        boolean existe = seccionesExistentes.stream()
                .anyMatch(s -> s.getNombreCurso().equalsIgnoreCase(nombreCurso));
        
        if (existe) {
            throw new SeccionServiceException("Ya existe una sección con ese nombre en el año " + anio);
        }
    }
    
    private void validarSeccionDuplicadaParaEdicion(Integer idProfesor, String nombreCurso, 
                                                     Integer anio, Integer idSeccionActual) {
        List<Seccion> seccionesExistentes = seccionRepository.findByProfesor_IdProfesorAndAnio(idProfesor, anio);
        
        boolean existe = seccionesExistentes.stream()
                .anyMatch(s -> s.getNombreCurso().equalsIgnoreCase(nombreCurso) 
                        && !s.getIdSeccion().equals(idSeccionActual));
        
        if (existe) {
            throw new SeccionServiceException("Ya existe una sección con ese nombre en el año " + anio);
        }
    }
    
    private Seccion obtenerSeccionConPermisos(Integer idSeccion, Integer idProfesor) {
        Seccion seccion = seccionRepository.findById(idSeccion)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));

        if (!seccion.getProfesor().getIdProfesor().equals(idProfesor)) {
            throw new SeccionServiceException("No tiene permisos para editar esta sección");
        }

        return seccion;
    }
    
    private Seccion construirSeccion(CrearSeccionRequest request, Profesor profesor) {
        Seccion seccion = new Seccion();
        seccion.setProfesor(profesor);
        seccion.setNombreCurso(request.getNombreCurso());
        seccion.setAnio(request.getAnio());
        seccion.setCodigo(request.getCodigo());
        return seccion;
    }
}