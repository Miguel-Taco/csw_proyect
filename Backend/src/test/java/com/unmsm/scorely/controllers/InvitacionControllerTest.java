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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
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
        invitacionResponse = new InvitacionResponse();
        invitacionRequest = new InvitacionRequest();
        invitacionRequest.setIdPersona(1);
        invitacionRequest.setCorreoAlumno("test@test.com");

        aceptarRequest = new AceptarInvitacionRequest();
        aceptarRequest.setToken("dummy-token-para-probar");
        aceptarRequest.setIdAlumno(123);
    }

    @Test
    void testCrearInvitacion_Success() throws Exception {
        when(invitacionService.buscarProfesorPorIdPersona(anyInt())).thenReturn(1);
        when(invitacionService.crearInvitacion(any(InvitacionRequest.class), anyInt()))
                .thenReturn(invitacionResponse);

        mockMvc.perform(post("/api/invitaciones")
                        .with(user("testUser")) // <-- AÑADE AUTENTICACIÓN
                        .with(csrf())           // <-- AÑADE CSRF
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invitacionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Invitación enviada exitosamente"));
    }

    @Test
    void testObtenerInformacionInvitacion_Success() throws Exception {
        String token = "dummy-token-123";
        when(invitacionService.obtenerInvitacionPorToken(token)).thenReturn(invitacionResponse);

        mockMvc.perform(get("/api/invitaciones/info")
                        .param("token", token)
                        .with(user("testUser"))) // <-- ¡AÑADE ESTO!
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Información de invitación obtenida"));
    }

    @Test
    void testConfirmarAceptacion_Success() throws Exception {
        AceptarInvitacionResponse successResponse = new AceptarInvitacionResponse();
        successResponse.setExito(true);

        when(invitacionService.buscarAlumnoPorIdPersona(anyInt())).thenReturn(20);
        when(invitacionService.aceptarInvitacion(anyString(), anyInt())).thenReturn(successResponse);

        mockMvc.perform(post("/api/invitaciones/confirmar")
                        .with(user("testUser")) // <-- ¡AÑADE ESTO!
                        .with(csrf())           // <-- ¡Y AÑADE ESTO!
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Te has unido al curso exitosamente"));
    }

    @Test
    void testConfirmarAceptacion_Failure() throws Exception {
        AceptarInvitacionResponse failResponse = new AceptarInvitacionResponse();
        failResponse.setExito(false);
        failResponse.setMensaje("El token ha expirado");

        when(invitacionService.buscarAlumnoPorIdPersona(anyInt())).thenReturn(20);
        when(invitacionService.aceptarInvitacion(anyString(), anyInt())).thenReturn(failResponse);

        mockMvc.perform(post("/api/invitaciones/confirmar")
                        .with(user("testUser")) // <-- AÑADE AUTENTICACIÓN
                        .with(csrf())           // <-- AÑADE CSRF
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El token ha expirado"));
    }

    @Test
    void testObtenerInvitacionesPendientesPorCorreo_Success() throws Exception {
        String correo = "test@alumno.com";
        List<InvitacionResponse> lista = Collections.singletonList(invitacionResponse);
        when(invitacionService.obtenerInvitacionesPendientes(correo)).thenReturn(lista);

        mockMvc.perform(get("/api/invitaciones/pendientes")
                        .with(user("testUser")) // <-- AÑADE AUTENTICACIÓN
                        .param("correo", correo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Invitaciones pendientes obtenidas"))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void testRechazarInvitacion_Success() throws Exception {
        doNothing().when(invitacionService).rechazarInvitacion(anyString());

        mockMvc.perform(post("/api/invitaciones/rechazar")
                        .with(user("testUser")) // <-- AÑADE AUTENTICACIÓN
                        .with(csrf())           // <-- AÑADE CSRF
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aceptarRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Invitación rechazada exitosamente"))
                .andExpect(jsonPath("$.data").value("Invitación rechazada"));
    }
}