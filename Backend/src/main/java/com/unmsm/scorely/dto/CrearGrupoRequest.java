package com.unmsm.scorely.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CrearGrupoRequest {

    @NotBlank(message = "El nombre del grupo es requerido")
    private String nombreGrupo;

    @NotNull(message = "El ID de la sección es requerido")
    private Integer seccionId;

    @NotEmpty(message = "Debe seleccionar al menos 2 alumnos")
    private List<Integer> alumnoIds;

    public CrearGrupoRequest() {}

    public CrearGrupoRequest(String nombreGrupo, Integer seccionId, List<Integer> alumnoIds) {
        this.nombreGrupo = nombreGrupo;
        this.seccionId = seccionId;
        this.alumnoIds = alumnoIds;
    }

    // Getters con nombres unificados esperados por el servicio
    public String getNombreGrupo() {
        return nombreGrupo;
    }

    public void setNombreGrupo(String nombreGrupo) {
        this.nombreGrupo = nombreGrupo;
    }

    public Integer getSeccionId() {
        return seccionId;
    }

    public void setSeccionId(Integer seccionId) {
        this.seccionId = seccionId;
    }

    public List<Integer> getAlumnoIds() {
        return alumnoIds;
    }

    public void setAlumnoIds(List<Integer> alumnoIds) {
        this.alumnoIds = alumnoIds;
    }

    // Compatibilidad: alias (por si alguna parte usa otros nombres)
    public Integer getIdSeccion() { return this.seccionId; }
    public List<Integer> getIdsAlumnos() { return this.alumnoIds; }
}