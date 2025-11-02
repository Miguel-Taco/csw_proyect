package com.unmsm.scorely.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.unmsm.scorely.models.Grupo;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Integer> {

    // Obtener todos los grupos de una sección con la cantidad de integrantes
    @Query("""
        SELECT g FROM Grupo g
        WHERE EXISTS (
            SELECT als FROM AlumnoSeccion als
            WHERE als.grupo.idGrupo = g.idGrupo
            AND als.seccion.idSeccion = :idSeccion
        )
        ORDER BY g.nombreGrupo
    """)
    List<Grupo> findGruposBySeccion(@Param("idSeccion") Integer idSeccion);
    
    // Contar integrantes de un grupo en una sección específica
    @Query("""
        SELECT COUNT(als) FROM AlumnoSeccion als
        WHERE als.grupo.idGrupo = :idGrupo
        AND als.seccion.idSeccion = :idSeccion
    """)
    Long contarIntegrantesPorGrupoYSeccion(
        @Param("idGrupo") Integer idGrupo,
        @Param("idSeccion") Integer idSeccion
    );
}