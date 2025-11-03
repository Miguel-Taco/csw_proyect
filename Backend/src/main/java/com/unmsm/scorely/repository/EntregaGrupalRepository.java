package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.EntregaGrupal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Map;

public interface EntregaGrupalRepository extends JpaRepository<EntregaGrupal, Integer> {
    @Query(value = "CALL sp_ObtenerEntregaGrupo(:p_id_seccion, :p_id_grupo, :p_id_tarea)",
            nativeQuery = true)
    Map<String, Object> obtenerEntregaGrupo(
            @Param("p_id_seccion") Integer idSeccion,
            @Param("p_id_grupo") Integer idGrupo,
            @Param("p_id_tarea") Integer idTarea
    );
}
