package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.Profesor; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfesorRepository extends JpaRepository<Profesor, Integer> {

    @Query("SELECT a.idProfesor FROM Profesor a WHERE a.persona.idPersona = :idPersona")
    Optional<Integer> findIdProfesorByIdPersona(@Param("idPersona") Integer idPersona);
}
