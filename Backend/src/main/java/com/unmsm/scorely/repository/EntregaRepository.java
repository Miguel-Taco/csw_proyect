package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Entrega;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface EntregaRepository extends JpaRepository<Entrega, Integer> {

    @Query("""
      SELECT ei.entrega
      FROM EntregaIndividual ei
      WHERE ei.entrega.tarea.idTarea = :idTarea
        AND ei.alumno.idAlumno = :idAlumno
      ORDER BY ei.entrega.fechaEntrega DESC
    """)
    List<Entrega> findByTareaAndAlumnoOrderByFechaDesc(@Param("idTarea") Integer idTarea,
                                                       @Param("idAlumno") Integer idAlumno);

    @Modifying
    @Query("UPDATE Entrega e SET e.nota = :nota WHERE e.idEntrega = :idEntrega")
    int updateNotaById(@Param("idEntrega") Integer idEntrega, @Param("nota") Double nota);

    /**
     * Obtiene los IDs de todas las tareas de una sección específica
     */
    @Query("""
        SELECT DISTINCT t.idTarea
        FROM Tarea t
        WHERE t.seccion.idSeccion = :idSeccion
    """)
    List<Integer> findTareasIdsBySeccion(@Param("idSeccion") Integer idSeccion);
}
