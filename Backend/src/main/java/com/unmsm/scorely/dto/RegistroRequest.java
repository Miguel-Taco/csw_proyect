package com.unmsm.scorely.dto;

import lombok.Getter;

@Getter
public class RegistroRequest {
    private String nombres;
    private String apellidoP;
    private String apellidoM;
    private String correo;
    private String contrasena;
    private String tipoUsuario; // "Estudiante" o "Profesor"
    private String codigoEstudiante; // Solo para Estudiante
}