package com.unmsm.scorely.dto;

import lombok.Data;

@Data
public class SeccionAlumnoDTO {
    private int idSeccion;
    private int id_profesor; // Puedes mantenerlo si es útil
    private String nombreCurso;
    private int anio;
    private int codigo;
    private String nombreProfesor; // 👈 El nuevo campo
}