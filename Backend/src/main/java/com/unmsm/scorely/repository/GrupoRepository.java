package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Integer> {

    // Verificar si ya existe un grupo con ese nombre
    @Query("SELECT COUNT(g) > 0 FROM Grupo g WHERE g.nombreGrupo = :nombreGrupo")
    boolean existsByNombreGrupo(@Param("nombreGrupo") String nombreGrupo);

    // Obtener todos los grupos con sus alumnos
    @Query("SELECT g FROM Grupo g LEFT JOIN FETCH g.alumnos")
    List<Grupo> findAllGrupos();
}
