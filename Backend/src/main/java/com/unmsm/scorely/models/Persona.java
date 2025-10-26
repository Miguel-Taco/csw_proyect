package com.unmsm.scorely.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Persona")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_persona")
    private Integer idPersona;

    @Column(name = "nombres", nullable = false, length = 50)
    private String nombres;

    @Column(name = "apellido_p", nullable = false, length = 50)
    private String apellidoP;

    @Column(name = "apellido_m", nullable = false, length = 50)
    private String apellidoM;

    @Column(name = "correo", length = 100)
    private String correo;

    @Column(name = "contrasena", length = 50)
    private String contrasena;
}
