package com.unmsm.scorely.exception;

public class RegistroCodigoEstudiante extends RuntimeException {
  public RegistroCodigoEstudiante() {
    super("El código de Estudiante es obligatorio");
  }
}
