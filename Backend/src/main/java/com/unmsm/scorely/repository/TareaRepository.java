package com.unmsm.scorely.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.unmsm.scorely.models.Tarea;

@Repository
public interface TareaRepository extends CrudRepository<Tarea, Integer> {

    @Query(value = """
        SELECT *
        FROM Tarea
        WHERE id_seccion = ?1
        """, nativeQuery = true)
    List<Tarea> findByIdSeccion(Integer idSeccion);

    List<Tarea> findBySeccionIdSeccionAndTipo(Integer idSeccion, String tipo);
}
