package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.AlumnoSeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlumnoSeccionRepository extends JpaRepository<AlumnoSeccion, Integer> {

    // Obtener alumnos de una sección sin grupo asignado
    @Query("SELECT als FROM AlumnoSeccion als " +
            "JOIN FETCH als.alumno a " +
            "JOIN FETCH a.persona p " +
            "WHERE als.seccion.idSeccion = :idSeccion " +
            "AND als.grupo IS NULL")
    List<AlumnoSeccion> findAlumnosSinGrupoBySeccion(@Param("idSeccion") Integer idSeccion);

    // Obtener todos los alumnos de una sección (con o sin grupo)
    @Query("SELECT als FROM AlumnoSeccion als " +
            "JOIN FETCH als.alumno a " +
            "JOIN FETCH a.persona p " +
            "LEFT JOIN FETCH als.grupo g " +
            "WHERE als.seccion.idSeccion = :idSeccion")
    List<AlumnoSeccion> findAllBySeccionWithGrupo(@Param("idSeccion") Integer idSeccion);

    // Verificar si un alumno ya tiene grupo en una sección
    @Query("SELECT COUNT(als) > 0 FROM AlumnoSeccion als " +
            "WHERE als.alumno.idAlumno = :idAlumno " +
            "AND als.seccion.idSeccion = :idSeccion " +
            "AND als.grupo IS NOT NULL")
    boolean alumnoTieneGrupo(@Param("idAlumno") Integer idAlumno,
                             @Param("idSeccion") Integer idSeccion);

    // Obtener AlumnoSeccion por alumno y sección - RETORNA OPTIONAL
    @Query("SELECT als FROM AlumnoSeccion als " +
            "WHERE als.alumno.idAlumno = :idAlumno " +
            "AND als.seccion.idSeccion = :idSeccion")
    Optional<AlumnoSeccion> findByAlumnoAndSeccion(@Param("idAlumno") Integer idAlumno,
                                                   @Param("idSeccion") Integer idSeccion);

    // Firma adicional usada en otros servicios: todos los alumnos de una sección (sin fetch obligatorio)
    @Query("SELECT als FROM AlumnoSeccion als WHERE als.seccion.idSeccion = :idSeccion")
    List<AlumnoSeccion> findBySeccion_IdSeccion(@Param("idSeccion") Integer idSeccion);

    @Query("""
        SELECT ast
        FROM AlumnoSeccion ast
        WHERE ast.grupo.idGrupo = :idGrupo
    """)
    List<AlumnoSeccion> findByGrupoId(@Param("idGrupo") Integer idGrupo);

    // Firma adicional para verificar existencia (con otro nombre esperado por servicios)
    @Query("SELECT COUNT(als) > 0 FROM AlumnoSeccion als " +
            "WHERE als.alumno.idAlumno = :idAlumno " +
            "AND als.seccion.idSeccion = :idSeccion")
    boolean existsByAlumnoAndSeccion(@Param("idAlumno") Integer idAlumno, @Param("idSeccion") Integer idSeccion);
}
