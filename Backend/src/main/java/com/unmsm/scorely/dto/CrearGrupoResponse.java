// java
package com.unmsm.scorely.dto;

import java.util.List;

public class CrearGrupoResponse {
    private Integer idGrupo;
    private String nombreGrupo;
    private Integer promedioFinal;
    private Integer seccionId;
    private Integer cantidadAlumnos;
    private List<AlumnoDTO> alumnos;

    public CrearGrupoResponse() {}

    public Integer getIdGrupo() { return idGrupo; }
    public void setIdGrupo(Integer idGrupo) { this.idGrupo = idGrupo; }

    public String getNombreGrupo() { return nombreGrupo; }
    public void setNombreGrupo(String nombreGrupo) { this.nombreGrupo = nombreGrupo; }

    public Integer getPromedioFinal() { return promedioFinal; }
    public void setPromedioFinal(Integer promedioFinal) { this.promedioFinal = promedioFinal; }

    public Integer getSeccionId() { return seccionId; }
    public void setSeccionId(Integer seccionId) { this.seccionId = seccionId; }

    public Integer getCantidadAlumnos() { return cantidadAlumnos; }
    public void setCantidadAlumnos(Integer cantidadAlumnos) { this.cantidadAlumnos = cantidadAlumnos; }

    public List<AlumnoDTO> getAlumnos() { return alumnos; }
    public void setAlumnos(List<AlumnoDTO> alumnos) { this.alumnos = alumnos; }
}
