package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.EntregaTareaRequest;
import com.unmsm.scorely.dto.EntregaTareaResponse;
import com.unmsm.scorely.dto.VerificarEntregaResponse;
import com.unmsm.scorely.services.EntregarTareaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entregas")
public class EntregarTareaController {

    private final EntregarTareaService entregaTareaService;

    // Inyección por constructor
    public EntregarTareaController(EntregarTareaService entregaTareaService) {
        this.entregaTareaService = entregaTareaService;
    }

    @PostMapping("/guardar")
    public ResponseEntity<EntregaTareaResponse> guardarEntrega(
            @RequestBody EntregaTareaRequest request) {

        EntregaTareaResponse response = entregaTareaService.guardarEntrega(request);

        if (Boolean.TRUE.equals(response.getSuccess())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verificar")
    public ResponseEntity<VerificarEntregaResponse> verificarEntrega(
            @RequestBody EntregaTareaRequest request) {

        VerificarEntregaResponse response = entregaTareaService.verificarEntrega(
                request.getIdPersona(),
                request.getIdTarea()
        );

        return ResponseEntity.ok(response);
    }
}