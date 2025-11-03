package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.RegistroRequest;
import com.unmsm.scorely.models.Persona;
import com.unmsm.scorely.services.RegistroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/registro")
@RequiredArgsConstructor
public class RegistroController {

    private final RegistroService registroService;

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        try {
            Persona persona = registroService.registrar(request);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Usuario registrado exitosamente");
            response.put("idPersona", persona.getIdPersona());
            response.put("nombres", persona.getNombres());
            response.put("correo", persona.getCorreo());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}