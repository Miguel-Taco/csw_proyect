package com.unmsm.scorely.repository;

import com.unmsm.scorely.enums.EstadoInvitacion;
import com.unmsm.scorely.models.Invitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InvitacionRepository extends JpaRepository<Invitacion, Integer> {
    Optional<Invitacion> findByToken(String token);

    @Query("SELECT i FROM Invitacion i WHERE i.correo = :correo " +
                "AND i.seccion.idSeccion = :idSeccion " +
                "AND i.estado = :estado")
    Optional<Invitacion> findByCorreoAndSeccionEstado(
            @Param("correo") String correo,
            @Param("idSeccion") Integer idSeccion,
            @Param("estado") EstadoInvitacion estado
    );

    List<Invitacion> findBySeccionIdSeccion(Integer idSeccion);

    @Query("SELECT COUNT(i) > 0 FROM Invitacion i WHERE i.correo = :correo " +
            "AND i.seccion.idSeccion = :idSeccion " +
            "AND i.estado = 'PENDIENTE'")
    boolean existsPendingInvitationByCorreoAndSeccion(
            @Param("correo") String correo,
            @Param("idSeccion") Integer idSeccion
    );

    @Query("""
        SELECT i FROM Invitacion i
        JOIN i.seccion s
        WHERE i.correo = :correo
        AND i.estado = 'PENDIENTE'
        AND i.fechaExpiracion > CURRENT_TIMESTAMP
        ORDER BY i.fechaCreacion DESC
    """)
    List<Invitacion> findPendingInvitationsByCorreo(@Param("correo") String correo);

}
