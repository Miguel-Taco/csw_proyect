package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeccionRepository extends JpaRepository<Seccion, Integer> {

    // Obtener todas las secciones de un profesor
    List<Seccion> findByProfesor_IdProfesor(Integer idProfesor);

    // Obtener secciones de un profesor por año
    List<Seccion> findByProfesor_IdProfesorAndAnio(Integer idProfesor, Integer anio);

    // Verificar si una sección pertenece a un profesor (para seguridad)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Seccion s WHERE s.idSeccion = ?1 AND s.profesor.idProfesor = ?2")
    boolean existsByIdSeccionAndProfesor_IdProfesor(Integer idSeccion, Integer idProfesor);
}

