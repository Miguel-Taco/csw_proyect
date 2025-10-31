package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EntregaRepository extends JpaRepository<Entrega, Integer> {

    @Query("""
      SELECT ei.entrega
      FROM EntregaIndividual ei
      WHERE ei.entrega.tarea.idTarea = :idTarea
        AND ei.alumno.idAlumno = :idAlumno
        AND ei.entrega.tarea.tipo = 'Individual'
      ORDER BY ei.entrega.fechaEntrega DESC
    """)
    List<Entrega> findByTareaAndAlumnoOrderByFechaDesc(@Param("idTarea") Integer idTarea,
                                                       @Param("idAlumno") Integer idAlumno);

    @Modifying
    @Query("UPDATE Entrega e SET e.nota = :nota WHERE e.idEntrega = :idEntrega")
    int updateNotaById(@Param("idEntrega") Integer idEntrega, @Param("nota") Double nota);

}
