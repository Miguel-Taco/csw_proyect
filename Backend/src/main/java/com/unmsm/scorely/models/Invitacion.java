package com.unmsm.scorely.models;

import com.unmsm.scorely.enums.EstadoInvitacion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Invitaciones")
@Data // para generar getter y setter
@Builder
@NoArgsConstructor // Constructor sin parámetros
@AllArgsConstructor // Constructor con todos los parámetros
public class Invitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // genera ID de 1 en 1
    @Column(name = "id_invitaciones")
    private Integer idInvitaciones;

    /*
     * Una invitación pertenece a una sección,
     * pero una sección puede tener muchas invitaciones
     */
    @ManyToOne(fetch = FetchType.LAZY) // Muchas invitaciones a una sola sección
    @JoinColumn(name = "id_seccion", nullable = false) // Indicar foranea
    private Seccion seccion;

    @Column(name = "correo", nullable = false, length = 50)
    private String correo;

    @Column(name = "estado", length = 30)
    @Enumerated(EnumType.STRING)
    private EstadoInvitacion estado;

    @Column(name = "token", unique = true, length = 100)
    private String token;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaExpiracion = LocalDateTime.now().plusHours(48); // Expira en 48 horas
    }

    public boolean isExpirada() {
        return LocalDateTime.now().isAfter(fechaExpiracion);
    }

    public boolean isPendiente() {
        return estado == EstadoInvitacion.PENDIENTE;
    }
}
