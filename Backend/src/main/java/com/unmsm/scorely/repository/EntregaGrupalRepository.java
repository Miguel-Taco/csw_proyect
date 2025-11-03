package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.EntregaGrupal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntregaGrupalRepository extends JpaRepository<EntregaGrupal, Integer> {

    // ✅ CORREGIDO: Hacer JOIN FETCH de entrega y luego de tarea
    @Query("SELECT eg FROM EntregaGrupal eg " +
            "JOIN FETCH eg.entrega e " +
            "JOIN FETCH e.tarea t " +
            "WHERE eg.grupo.idGrupo = :idGrupo")
    List<EntregaGrupal> findByGrupo_IdGrupo(@Param("idGrupo") Integer idGrupo);
}