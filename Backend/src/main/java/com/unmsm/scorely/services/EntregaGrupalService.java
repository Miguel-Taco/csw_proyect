package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.IntegranteGrupoDTO;
import com.unmsm.scorely.dto.NotasDeTareas;
import com.unmsm.scorely.dto.RegistrarEntregasRequest;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntregaGrupalService {
    private final EntregaRepository entregaRepository;
    private final TareaRepository tareaRepository;
    private final GrupoRepository grupoRepository;
    private final EntregaGrupalRepository entregaGrupalRepository;
    private final AlumnoSeccionRepository alumnoSeccionRepository;

    public EntregaGrupalService(EntregaRepository entregaRepository,
                                TareaRepository tareaRepository,
                                GrupoRepository grupoRepository,
                                EntregaGrupalRepository entregaGrupalRepository,
                                AlumnoSeccionRepository alumnoSeccionRepository) {
        this.entregaRepository = entregaRepository;
        this.tareaRepository = tareaRepository;
        this.grupoRepository = grupoRepository;
        this.entregaGrupalRepository = entregaGrupalRepository;
        this.alumnoSeccionRepository = alumnoSeccionRepository;
    }

    @Transactional
    public Entrega registrarEntregaGrupalConNota(RegistrarEntregasRequest req) {
        // Validaciones básicas
        if (req.getNota() == null || req.getNota() < 0 || req.getNota() > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }

        Tarea tarea = tareaRepository.findById(req.getIdTarea())
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + req.getIdTarea()));

        // Verificar que la tarea sea grupal
        if (!"Grupal".equals(tarea.getTipo())) {
            throw new IllegalArgumentException("La tarea no es de tipo Grupal");
        }

        Grupo grupo = grupoRepository.findById(req.getIdGrupo())
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado: " + req.getIdGrupo()));

        Entrega entrega = new Entrega();
        entrega.setTarea(tarea);
        entrega.setNota(BigDecimal.valueOf(req.getNota()));

        entrega = entregaRepository.save(entrega);

        // Registrar relación EntregaGrupal
        EntregaGrupal eg = new EntregaGrupal();
        eg.setEntrega(entrega);
        eg.setGrupo(grupo);
        entregaGrupalRepository.save(eg);

        return entrega;
    }

    @Transactional(readOnly = true)
    public List<NotasDeTareas> obtenerTareasNotasGrupos(Integer idSeccion, Integer idGrupo) {
        List<Tarea> tareasGrupales = tareaRepository.findBySeccionIdSeccionAndTipo(idSeccion, "Grupal");

        return tareasGrupales.stream().map(tarea -> {
            List<Entrega> entregas = entregaRepository.findByTareaAndGrupoOrderByFechaDesc(
                    tarea.getIdTarea(),
                    idGrupo
            );

            Entrega ultimaEntrega = entregas.isEmpty() ? null : entregas.get(0);

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

    @Transactional
    public void actualizarNotaPorTareaYGrupo(Integer idTarea, Integer idGrupo, Double nuevaNota) {
        if (nuevaNota == null || nuevaNota < 0 || nuevaNota > 20) {
            throw new IllegalArgumentException("Nota inválida (0-20).");
        }

        List<Entrega> entregas = entregaRepository.findByTareaAndGrupoOrderByFechaDesc(idTarea, idGrupo);
        if (entregas.isEmpty()) {
            throw new EntityNotFoundException("No se encontró entrega para tarea " + idTarea + " y grupo " + idGrupo);
        }

        // Tomar la última entrega por fecha
        Entrega ultima = entregas.get(0);
        ultima.setNota(BigDecimal.valueOf(nuevaNota));
        entregaRepository.save(ultima);
    }

    @Transactional(readOnly = true)
    public List<IntegranteGrupoDTO> obtenerIntegrantesGrupo(Integer idGrupo) {
        List<AlumnoSeccion> alumnosSeccion = alumnoSeccionRepository.findByGrupoId(idGrupo);

        return alumnosSeccion.stream()
                .map(as -> {
                    Persona persona = as.getAlumno().getPersona();
                    String nombreCompleto = persona.getNombres() + " " +
                            persona.getApellidoP() + " " +
                            persona.getApellidoM();
                    return new IntegranteGrupoDTO(nombreCompleto);
                })
                .toList();
    }
}
