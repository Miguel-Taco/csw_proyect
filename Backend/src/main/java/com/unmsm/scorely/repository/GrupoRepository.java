package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Grupo;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.unmsm.scorely.models.Grupo;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Integer> {

    // Verificar si ya existe un grupo con ese nombre
    @Query("SELECT COUNT(g) > 0 FROM Grupo g WHERE g.nombreGrupo = :nombreGrupo")
    boolean existsByNombreGrupo(@Param("nombreGrupo") String nombreGrupo);

    // Obtener todos los grupos con sus alumnos
    @Query("SELECT g FROM Grupo g LEFT JOIN FETCH g.alumnos")
    List<Grupo> findAllGrupos();

    @Query(value = "CALL ObtenerCompaneros(:idSeccion, :idPersona)", nativeQuery = true)
    List<Object[]> obtenerCompaneros(
            @Param("idSeccion") Integer idSeccion,
            @Param("idPersona") Integer idPersona
    );

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
