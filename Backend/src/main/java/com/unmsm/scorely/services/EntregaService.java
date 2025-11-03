package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.NotasDeTareas;
import com.unmsm.scorely.dto.RegistrarEntregasRequest;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EntregaService {
    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final AlumnoRepository alumnoRepository;
    private final EntregaIndividualRepository entregaIndividualRepository;

    public EntregaService(EntregaRepository entregaRepository,
                          TareaRepository tareaRepository,
                          AlumnoRepository alumnoRepository,
                          EntregaIndividualRepository entregaIndividualRepository) {
        this.entregaRepository = entregaRepository;
        this.tareaRepository = tareaRepository;
        this.alumnoRepository = alumnoRepository;
        this.entregaIndividualRepository = entregaIndividualRepository;
    }

    @Transactional
    public Entrega registrarEntregaConNota(RegistrarEntregasRequest req) {
        // Validaciones básicas
        if (req.getNota() == null || req.getNota() < 0 || req.getNota() > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }

        Tarea tarea = tareaRepository.findById(req.getIdTarea())
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + req.getIdTarea()));

        Alumno alumno = alumnoRepository.findById(req.getIdAlumno())
                .orElseThrow(() -> new EntityNotFoundException("Alumno no encontrado: " + req.getIdAlumno()));

        Entrega entrega = new Entrega();
        entrega.setTarea(tarea);
        entrega.setNota(BigDecimal.valueOf(req.getNota()));

        entrega = entregaRepository.save(entrega);

        // Registrar relación EntregaIndividual (vincular alumno con la entrega)
        EntregaIndividual ei = new EntregaIndividual();
        ei.setEntrega(entrega);
        ei.setAlumno(alumno);
        entregaIndividualRepository.save(ei);

        return entrega;
    }

    @Transactional
    public void actualizarNotaPorIdEntrega(Integer idEntrega, Double nuevaNota) {
        if (nuevaNota == null || nuevaNota < 0 || nuevaNota > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }

        Entrega entrega = entregaRepository.findById(idEntrega)
                .orElseThrow(() -> new EntityNotFoundException("Entrega no encontrada: " + idEntrega));

        entrega.setNota(BigDecimal.valueOf(nuevaNota));
        entregaRepository.save(entrega);
    }

    @Transactional
    public void actualizarNotaPorTareaYAlumno(Integer idTarea, Integer idAlumno, Double nuevaNota) {
        if (nuevaNota == null || nuevaNota < 0 || nuevaNota > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }

        List<Entrega> entregas = entregaRepository.findByTareaAndAlumnoOrderByFechaDesc(idTarea, idAlumno);
        if (entregas.isEmpty()) {
            throw new EntityNotFoundException("No se encontró entrega para tarea " + idTarea + " y alumno " + idAlumno);
        }

        // tomar la última entrega por fecha
        Entrega ultima = entregas.get(0);
        ultima.setNota(BigDecimal.valueOf(nuevaNota));
        entregaRepository.save(ultima);
    }

    // Alternativa: actualizar sin cargar entidad (más eficiente para muchos cambios)
    @Transactional
    public void actualizarNotaDirecto(Integer idEntrega, Double nuevaNota) {
        if (nuevaNota == null || nuevaNota < 0 || nuevaNota > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }
        int updated = entregaRepository.updateNotaById(idEntrega, nuevaNota);
        if (updated == 0) {
            throw new EntityNotFoundException("Entrega no encontrada: " + idEntrega);
        }
    }

    @Transactional(readOnly = true)
    public List<NotasDeTareas> obtenerTareasNotasAlumno(Integer idSeccion, Integer idAlumno) {
        // 1. Obtener todas las tareas de la sección
        List<Tarea> tareas = tareaRepository.findBySeccionIdSeccionAndTipo(idSeccion, "Individual");
        // 2. Para cada tarea, buscar si existe una entrega del alumno
        return tareas.stream().map(tarea -> {
            // Buscar las entregas del alumno para esta tarea
            List<Entrega> entregas = entregaRepository.findByTareaAndAlumnoOrderByFechaDesc(
                    tarea.getIdTarea(),
                    idAlumno
            );
            // Si hay entregas, tomar la más reciente (primera en la lista)
            Entrega ultimaEntrega = entregas.isEmpty() ? null : entregas.get(0);

            // Construir el DTO
            return new NotasDeTareas(
                    tarea.getIdTarea(),
                    tarea.getNombre(), // o el nombre del campo que uses para el título
                    ultimaEntrega != null ? ultimaEntrega.getIdEntrega() : null,
                    ultimaEntrega != null && ultimaEntrega.getNota() != null
                            ? ultimaEntrega.getNota().doubleValue()
                            : null
            );
        }).toList();
    }
}
