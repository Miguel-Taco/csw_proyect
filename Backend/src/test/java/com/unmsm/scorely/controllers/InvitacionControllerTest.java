package com.unmsm.scorely.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.unmsm.scorely.dto.AceptarInvitacionRequest;
import com.unmsm.scorely.dto.AceptarInvitacionResponse;
import com.unmsm.scorely.dto.InvitacionRequest;
import com.unmsm.scorely.dto.InvitacionResponse;
import com.unmsm.scorely.services.InvitacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//Terrible, no sé por que falla
@SuppressWarnings("deprecation")
@WebMvcTest(InvitacionController.class)
class InvitacionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvitacionService invitacionService;

    @Autowired
    private ObjectMapper objectMapper;

    private InvitacionRequest invitacionRequest;
    private InvitacionResponse invitacionResponse;
    private AceptarInvitacionRequest aceptarRequest;

    @BeforeEach
    void setUp() {
        invitacionRequest = new InvitacionRequest();
        invitacionResponse = new InvitacionResponse();
        aceptarRequest = new AceptarInvitacionRequest();
    }

    @Test
    void testCrearInvitacion_Success() throws Exception {
        when(invitacionService.buscarProfesorPorIdPersona(anyInt())).thenReturn(1);
        when(invitacionService.crearInvitacion(any(InvitacionRequest.class), anyInt()))
            .thenReturn(invitacionResponse);

        mockMvc.perform(post("/api/invitaciones")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invitacionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Invitación enviada exitosamente"));
    }

    @Test
    void testObtenerInformacionInvitacion_Success() throws Exception {
        // --- Arrange ---
        String token = "dummy-token-123";
        when(invitacionService.obtenerInvitacionPorToken(token)).thenReturn(invitacionResponse);

        // --- Act & Assert ---
        mockMvc.perform(get("/api/invitaciones/info") // Petición GET
                        .param("token", token)) // Añadimos el RequestParam
                .andExpect(status().isOk()) // Esperamos un status 200 (OK)
                .andExpect(jsonPath("$.message").value("Información de invitación obtenida"));
        // .andExpect(jsonPath("$.data.nombreCurso").value("Diseño de Software"));
    }

    @Test
    void testConfirmarAceptacion_Success() throws Exception {
        // --- Arrange ---
        AceptarInvitacionResponse successResponse = new AceptarInvitacionResponse();
        // Asumiendo que AceptarInvitacionResponse tiene setters o constructor
        // successResponse.setExito(true);
        // successResponse.setMensaje("¡Bienvenido!");

        when(invitacionService.buscarAlumnoPorIdPersona(anyInt())).thenReturn(20); // Devuelve un ID de alumno
        when(invitacionService.aceptarInvitacion(anyString(), anyInt())).thenReturn(successResponse);

        // --- Act & Assert ---
        mockMvc.perform(post("/api/invitaciones/confirmar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isOk()) // Esperamos OK porque exito = true
                .andExpect(jsonPath("$.message").value("Te has unido al curso exitosamente"));
        // .andExpect(jsonPath("$.data.exito").value(true));
    }

    @Test
    void testConfirmarAceptacion_Failure() throws Exception {
        // --- Arrange ---
        // Este es el caso donde la lógica del servicio falla (ej. token expirado)
        AceptarInvitacionResponse failResponse = new AceptarInvitacionResponse();
        // failResponse.setExito(false);
        // failResponse.setMensaje("El token ha expirado"); // Mensaje de error del servicio

        when(invitacionService.buscarAlumnoPorIdPersona(anyInt())).thenReturn(20);
        when(invitacionService.aceptarInvitacion(anyString(), anyInt())).thenReturn(failResponse);

        // --- Act & Assert ---
        mockMvc.perform(post("/api/invitaciones/confirmar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isBadRequest()) // Esperamos BAD_REQUEST porque exito = false
                .andExpect(jsonPath("$.message").value("El token ha expirado")); // Verifica el mensaje de error
        // .andExpect(jsonPath("$.data.exito").value(false));
    }

    @Test
    void testObtenerInvitacionesPendientesPorCorreo_Success() throws Exception {
        // --- Arrange ---
        String correo = "test@alumno.com";
        List<InvitacionResponse> lista = Collections.singletonList(invitacionResponse);
        when(invitacionService.obtenerInvitacionesPendientes(correo)).thenReturn(lista);

        // --- Act & Assert ---
        mockMvc.perform(get("/api/invitaciones/pendientes")
                        .param("correo", correo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Invitaciones pendientes obtenidas"))
                .andExpect(jsonPath("$.data.length()").value(1)); // Verificamos que la lista tiene 1 elemento
        // .andExpect(jsonPath("$.data[0].token").value("dummy-token-123"));
    }

    @Test
    void testRechazarInvitacion_Success() throws Exception {
        // --- Arrange ---
        // Los métodos void se mockean con doNothing()
        doNothing().when(invitacionService).rechazarInvitacion(anyString());

        // --- Act & Assert ---
        mockMvc.perform(post("/api/invitaciones/rechazar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Invitación rechazada exitosamente"))
                .andExpect(jsonPath("$.data").value("Invitación rechazada"));
    }
}