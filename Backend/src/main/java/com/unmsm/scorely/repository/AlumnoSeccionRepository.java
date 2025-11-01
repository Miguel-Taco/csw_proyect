
package com.unmsm.scorely.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.unmsm.scorely.models.AlumnoSeccion;

public interface AlumnoSeccionRepository extends JpaRepository<AlumnoSeccion, Integer> {

    //Verifica si existe el alumno en la sección
    @Query("SELECT COUNT(als) > 0 FROM AlumnoSeccion als " +
            "WHERE als.alumno.idAlumno = :idAlumno " +
            "AND als.seccion.idSeccion = :idSeccion")
    boolean existsByAlumnoAndSeccion(
            @Param("idAlumno") Integer idAlumno,
            @Param("idSeccion") Integer idSeccion
    );

    @Query("SELECT als FROM AlumnoSeccion als " +
            "WHERE als.alumno.idAlumno = :idAlumno " +
            "AND als.seccion.idSeccion = :idSeccion")
    Optional<AlumnoSeccion> findByAlumnoAndSeccion(
            @Param("idAlumno") Integer idAlumno,
            @Param("idSeccion") Integer idSeccion
    );

    // ✅ NUEVO: Obtener todos los alumnos de una sección
    @Query("SELECT als FROM AlumnoSeccion als " +
            "JOIN FETCH als.alumno a " +
            "JOIN FETCH a.persona p " +
            "WHERE als.seccion.idSeccion = :idSeccion " +
            "ORDER BY p.apellidoP, p.apellidoM, p.nombres")
    List<AlumnoSeccion> findBySeccion_IdSeccion(@Param("idSeccion") Integer idSeccion);

    @Query("""
        SELECT as
        FROM AlumnoSeccion as
        WHERE as.grupo.idGrupo = :idGrupo
    """)
    List<AlumnoSeccion> findByGrupoId(@Param("idGrupo") Integer idGrupo);
}
