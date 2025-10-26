package com.unmsm.scorely.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "v_usuario_info")
@Data
public class PersonaUser {

    @Id
    @Column(name = "id_persona")
    private Integer idPersona;

    private String nombres;

    @Column(name = "apellido_p")
    private String apellidoP;

    @Column(name = "apellido_m")
    private String apellidoM;

    private String correo;
    private String tipo;

    @Column(name = "codigo_alumno")
    private String codigoAlumno;
}