package com.unmsm.scorely.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class NotasDeTareas {
    private Integer idTarea;
    private String nombreTarea;
    private Integer idEntrega;
    private Double nota;
}
