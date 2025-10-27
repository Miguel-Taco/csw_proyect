package com.unmsm.scorely.services.imp;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.unmsm.scorely.dto.CrearTareaRequest;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.models.Tarea;
import com.unmsm.scorely.repository.SeccionRepository;
import com.unmsm.scorely.repository.TareaRepository;

class TareaServiceImpTest {

    @Mock
    private TareaRepository tareaRepository;

    @Mock
    private SeccionRepository seccionRepository;

    @InjectMocks
    private TareaServiceImp tareaService;

    private CrearTareaRequest request;
    private Seccion seccion;
    private Tarea tarea;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Configurar datos de prueba
        seccion = new Seccion();
        seccion.setIdSeccion(1);
        seccion.setNombreCurso("Calidad de Software");

        request = new CrearTareaRequest();
        request.setIdSeccion(1);
        request.setNombre("Tarea de Prueba");
        request.setTipo("Individual");
        request.setDescripcion("Descripción de prueba");
        request.setFechaVencimiento(LocalDateTime.now().plusDays(7));

        tarea = new Tarea();
        tarea.setIdTarea(1);
        tarea.setNombre(request.getNombre());
        tarea.setTipo(request.getTipo());
        tarea.setDescripcion(request.getDescripcion());
        tarea.setFechaVencimiento(request.getFechaVencimiento());
        tarea.setSeccion(seccion);
        tarea.setFechaCreacion(LocalDateTime.now());
    }

    @Test
    @DisplayName("Crear tarea exitosamente")
    void testCrearTarea_Exitoso() {
        // Arrange
        when(seccionRepository.findById(1)).thenReturn(Optional.of(seccion));
        when(tareaRepository.save(any(Tarea.class))).thenReturn(tarea);

        // Act
        Tarea resultado = tareaService.crearTarea(request);

        // Assert
        assertNotNull(resultado, "La tarea no debe ser null");
        assertEquals("Tarea de Prueba", resultado.getNombre());
        assertEquals("Individual", resultado.getTipo());
        assertEquals("Descripción de prueba", resultado.getDescripcion());
        assertEquals(seccion, resultado.getSeccion());
        
        verify(seccionRepository, times(1)).findById(1);
        verify(tareaRepository, times(1)).save(any(Tarea.class));
    }

    @Test
    @DisplayName("Crear tarea con sección inexistente retorna null")
    void testCrearTarea_SeccionNoExiste() {
        // Arrange
        when(seccionRepository.findById(999)).thenReturn(Optional.empty());
        request.setIdSeccion(999);

        // Act
        Tarea resultado = tareaService.crearTarea(request);

        // Assert
        assertNull(resultado, "Debe retornar null si la sección no existe");
        verify(seccionRepository, times(1)).findById(999);
        verify(tareaRepository, never()).save(any(Tarea.class));
    }

    @Test
    @DisplayName("Crear tarea con idSeccion null usa default 3")
    void testCrearTarea_IdSeccionNull() {
        // Arrange
        request.setIdSeccion(null);
        Seccion seccionDefault = new Seccion();
        seccionDefault.setIdSeccion(3);
        
        when(seccionRepository.findById(3)).thenReturn(Optional.of(seccionDefault));
        when(tareaRepository.save(any(Tarea.class))).thenReturn(tarea);

        // Act
        Tarea resultado = tareaService.crearTarea(request);

        // Assert
        assertNotNull(resultado);
        verify(seccionRepository, times(1)).findById(3);
    }

    @Test
    @DisplayName("Listar tareas por sección")
    void testListarPorSeccion() {
        // Arrange
        when(tareaRepository.findByIdSeccion(1)).thenReturn(java.util.Arrays.asList(tarea));

        // Act
        var resultado = tareaService.listarPorSeccion(1);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Tarea de Prueba", resultado.get(0).getNombre());
        verify(tareaRepository, times(1)).findByIdSeccion(1);
    }

    @Test
    @DisplayName("Obtener tarea por ID")
    void testObtenerPorId() {
        // Arrange
        when(tareaRepository.findById(1)).thenReturn(Optional.of(tarea));

        // Act
        Tarea resultado = tareaService.obtenerPorId(1);

        // Assert
        assertNotNull(resultado);
        assertEquals(1, resultado.getIdTarea());
        assertEquals("Tarea de Prueba", resultado.getNombre());
        verify(tareaRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Obtener tarea por ID inexistente retorna null")
    void testObtenerPorId_NoExiste() {
        // Arrange
        when(tareaRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Tarea resultado = tareaService.obtenerPorId(999);

        // Assert
        assertNull(resultado);
        verify(tareaRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("Eliminar tarea exitosamente")
    void testEliminarTarea_Exitoso() {
        // Arrange
        when(tareaRepository.existsById(1)).thenReturn(true);
        doNothing().when(tareaRepository).deleteById(1);

        // Act
        boolean resultado = tareaService.eliminarTarea(1);

        // Assert
        assertTrue(resultado);
        verify(tareaRepository, times(1)).existsById(1);
        verify(tareaRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Eliminar tarea inexistente retorna false")
    void testEliminarTarea_NoExiste() {
        // Arrange
        when(tareaRepository.existsById(999)).thenReturn(false);

        // Act
        boolean resultado = tareaService.eliminarTarea(999);

        // Assert
        assertFalse(resultado);
        verify(tareaRepository, times(1)).existsById(999);
        verify(tareaRepository, never()).deleteById(anyInt());
    }

    @Test
    @DisplayName("Actualizar tarea exitosamente")
    void testActualizarTarea_Exitoso() {
        // Arrange
        CrearTareaRequest updateRequest = new CrearTareaRequest();
        updateRequest.setIdSeccion(1);
        updateRequest.setNombre("Tarea Actualizada");
        updateRequest.setTipo("Grupal");
        updateRequest.setDescripcion("Descripción actualizada");
        updateRequest.setFechaVencimiento(LocalDateTime.now().plusDays(10));

        when(tareaRepository.findById(1)).thenReturn(Optional.of(tarea));
        when(seccionRepository.findById(1)).thenReturn(Optional.of(seccion));
        when(tareaRepository.save(any(Tarea.class))).thenReturn(tarea);

        // Act
        Tarea resultado = tareaService.actualizarTarea(1, updateRequest);

        // Assert
        assertNotNull(resultado);
        verify(tareaRepository, times(1)).findById(1);
        verify(tareaRepository, times(1)).save(any(Tarea.class));
    }

    @Test
    @DisplayName("Actualizar tarea inexistente retorna null")
    void testActualizarTarea_NoExiste() {
        // Arrange
        when(tareaRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Tarea resultado = tareaService.actualizarTarea(999, request);

        // Assert
        assertNull(resultado);
        verify(tareaRepository, times(1)).findById(999);
        verify(tareaRepository, never()).save(any(Tarea.class));
    }
}