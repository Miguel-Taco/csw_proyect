package com.unmsm.scorely.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.unmsm.scorely.config.SecurityConfig;
import com.unmsm.scorely.dto.CrearTareaRequest;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.models.Tarea;
import com.unmsm.scorely.models.Profesor;
import com.unmsm.scorely.services.TareaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TareaController.class)
@Import(SecurityConfig.class) // ✅ Importar configuración de seguridad
class TareaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TareaService tareaService;

    private CrearTareaRequest request;
    private Tarea tarea;
    private Seccion seccion;
    private Profesor profesor;

    @BeforeEach
    void setUp() {
        // ✅ Configurar ObjectMapper para manejar LocalDateTime
        objectMapper.registerModule(new JavaTimeModule());
        
        // Configurar Profesor
        profesor = new Profesor();
        profesor.setIdProfesor(1);
        
        // Configurar Seccion (sin lazy loading issues)
        seccion = new Seccion();
        seccion.setIdSeccion(1);
        seccion.setNombreCurso("Calidad de Software");
        seccion.setAnio(2024);
        seccion.setCodigo(101);
        seccion.setProfesor(profesor);

        // Configurar Request
        request = new CrearTareaRequest();
        request.setIdSeccion(1);
        request.setNombre("Tarea Test");
        request.setTipo("Individual");
        request.setDescripcion("Descripción test");
        request.setFechaVencimiento(LocalDateTime.now().plusDays(7));

        // Configurar Tarea
        tarea = new Tarea();
        tarea.setIdTarea(1);
        tarea.setNombre("Tarea Test");
        tarea.setTipo("Individual");
        tarea.setDescripcion("Descripción test");
        tarea.setSeccion(seccion);
        tarea.setFechaCreacion(LocalDateTime.now());
        tarea.setFechaVencimiento(request.getFechaVencimiento());
    }

    @Test
    @DisplayName("POST /api/tareas - Crear tarea exitosamente")
    void testCrearTarea_Exitoso() throws Exception {
        // Arrange
        when(tareaService.crearTarea(any(CrearTareaRequest.class))).thenReturn(tarea);

        // Act & Assert
        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idTarea").value(1))
                .andExpect(jsonPath("$.nombre").value("Tarea Test"))
                .andExpect(jsonPath("$.tipo").value("Individual"));

        verify(tareaService, times(1)).crearTarea(any(CrearTareaRequest.class));
    }

    @Test
    @DisplayName("POST /api/tareas - Error al crear tarea (servicio retorna null)")
    void testCrearTarea_Error() throws Exception {
        // Arrange
        when(tareaService.crearTarea(any(CrearTareaRequest.class))).thenReturn(null);

        // Act & Assert
        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());

        verify(tareaService, times(1)).crearTarea(any(CrearTareaRequest.class));
    }

    @Test
    @DisplayName("POST /api/tareas - Manejo de excepción del servicio")
    void testCrearTarea_ExcepcionServicio() throws Exception {
        // Arrange
        when(tareaService.crearTarea(any(CrearTareaRequest.class)))
                .thenThrow(new RuntimeException("Error en base de datos"));

        // Act & Assert
        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());

        verify(tareaService, times(1)).crearTarea(any(CrearTareaRequest.class));
    }

    @Test
    @DisplayName("GET /api/tareas/seccion/{idSeccion} - Listar tareas")
    void testListarTareasPorSeccion() throws Exception {
        // Arrange
        when(tareaService.listarPorSeccion(1)).thenReturn(Arrays.asList(tarea));

        // Act & Assert
        mockMvc.perform(get("/api/tareas/seccion/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tareas").isArray())
                .andExpect(jsonPath("$.tareas[0].nombre").value("Tarea Test"));

        verify(tareaService, times(1)).listarPorSeccion(1);
    }

    @Test
    @DisplayName("GET /api/tareas/seccion/{idSeccion} - Sin tareas")
    void testListarTareasPorSeccion_Vacio() throws Exception {
        // Arrange
        when(tareaService.listarPorSeccion(1)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/tareas/seccion/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tareas").isEmpty());

        verify(tareaService, times(1)).listarPorSeccion(1);
    }

    @Test
    @DisplayName("GET /api/tareas/seccion/{idSeccion} - Manejo de excepción")
    void testListarTareasPorSeccion_Excepcion() throws Exception {
        // Arrange
        when(tareaService.listarPorSeccion(1))
                .thenThrow(new RuntimeException("Error al listar"));

        // Act & Assert
        mockMvc.perform(get("/api/tareas/seccion/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));

        verify(tareaService, times(1)).listarPorSeccion(1);
    }

    @Test
    @DisplayName("GET /api/tareas/{idTarea} - Obtener tarea por ID")
    void testObtenerTareaPorId() throws Exception {
        // Arrange
        when(tareaService.obtenerPorId(1)).thenReturn(tarea);

        // Act & Assert
        mockMvc.perform(get("/api/tareas/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tarea.idTarea").value(1))
                .andExpect(jsonPath("$.tarea.nombre").value("Tarea Test"));

        verify(tareaService, times(1)).obtenerPorId(1);
    }

    @Test
    @DisplayName("GET /api/tareas/{idTarea} - Tarea no encontrada")
    void testObtenerTareaPorId_NoEncontrada() throws Exception {
        // Arrange
        when(tareaService.obtenerPorId(999)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/tareas/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        verify(tareaService, times(1)).obtenerPorId(999);
    }

    @Test
    @DisplayName("PUT /api/tareas/{idTarea} - Actualizar tarea exitosamente")
    void testActualizarTarea_Exitoso() throws Exception {
        // Arrange
        Tarea tareaActualizada = new Tarea();
        tareaActualizada.setIdTarea(1);
        tareaActualizada.setNombre("Tarea Actualizada");
        tareaActualizada.setTipo("Grupal");
        tareaActualizada.setDescripcion("Nueva descripción");
        tareaActualizada.setSeccion(seccion);
        
        when(tareaService.actualizarTarea(eq(1), any(CrearTareaRequest.class)))
                .thenReturn(tareaActualizada);

        // Act & Assert
        mockMvc.perform(put("/api/tareas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tarea actualizada exitosamente"));

        verify(tareaService, times(1)).actualizarTarea(eq(1), any(CrearTareaRequest.class));
    }

    @Test
    @DisplayName("PUT /api/tareas/{idTarea} - Tarea no encontrada")
    void testActualizarTarea_NoEncontrada() throws Exception {
        // Arrange
        when(tareaService.actualizarTarea(eq(999), any(CrearTareaRequest.class)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(put("/api/tareas/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        verify(tareaService, times(1)).actualizarTarea(eq(999), any(CrearTareaRequest.class));
    }

    @Test
    @DisplayName("DELETE /api/tareas/{idTarea} - Eliminar tarea exitosamente")
    void testEliminarTarea_Exitoso() throws Exception {
        // Arrange
        when(tareaService.eliminarTarea(1)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/tareas/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tarea eliminada exitosamente"));

        verify(tareaService, times(1)).eliminarTarea(1);
    }

    @Test
    @DisplayName("DELETE /api/tareas/{idTarea} - Tarea no existe")
    void testEliminarTarea_NoExiste() throws Exception {
        // Arrange
        when(tareaService.eliminarTarea(999)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/tareas/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        verify(tareaService, times(1)).eliminarTarea(999);
    }

    @Test
    @DisplayName("POST /api/tareas - Request con datos inválidos")
    void testCrearTarea_DatosInvalidos() throws Exception {
        // Arrange - Request sin nombre
        CrearTareaRequest requestInvalido = new CrearTareaRequest();
        requestInvalido.setIdSeccion(1);
        // nombre es null
        requestInvalido.setTipo("Individual");
        
        when(tareaService.crearTarea(any(CrearTareaRequest.class))).thenReturn(null);

        // Act & Assert
        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isInternalServerError());
    }
}
