package com.unmsm.scorely.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Grupo")
@Data  // ← Genera setters y getters automáticamente
@NoArgsConstructor
@AllArgsConstructor
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo")
    private Integer idGrupo;

    @Column(name = "nombre_grupo", length = 20, nullable = false)
    private String nombreGrupo;

    @Column(name = "promedio_final")
    private Integer promedioFinal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seccion")
    private Seccion seccion;

    @ManyToMany
    @JoinTable(
            name = "grupo_alumno",
            joinColumns = @JoinColumn(name = "id_grupo"),
            inverseJoinColumns = @JoinColumn(name = "id_alumno")
    )
    private Set<Alumno> alumnos = new HashSet<>();

    public void addAlumno(Alumno a) {
        this.alumnos.add(a);
    }

    public void removeAlumno(Alumno a) {
        this.alumnos.remove(a);
    }
}
