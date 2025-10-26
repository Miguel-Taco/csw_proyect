package com.unmsm.scorely.services;

import com.unmsm.scorely.dto.CrearTareaRequest;
import com.unmsm.scorely.models.Tarea;
import java.util.List;

public interface TareaService {
    Tarea crearTarea(CrearTareaRequest req);
    List<Tarea> listarPorSeccion(Integer idSeccion);
    Tarea obtenerPorId(Integer idTarea);
    boolean eliminarTarea(Integer idTarea);
    Tarea actualizarTarea(Integer idTarea, CrearTareaRequest req);
}