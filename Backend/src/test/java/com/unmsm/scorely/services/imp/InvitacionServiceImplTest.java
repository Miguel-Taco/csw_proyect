package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.dto.InvitacionRequest;
import com.unmsm.scorely.dto.InvitacionResponse;
import com.unmsm.scorely.enums.EstadoInvitacion;
import com.unmsm.scorely.models.*;
import com.unmsm.scorely.repository.AlumnoRepository;
import com.unmsm.scorely.repository.InvitacionRepository;
import com.unmsm.scorely.repository.SeccionRepository;
import com.unmsm.scorely.services.EmailService;
import com.unmsm.scorely.services.MatriculaService;
import com.unmsm.scorely.services.TokenGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitacionServiceImplTest {

    @Mock private InvitacionRepository invitacionRepository;
    @Mock private SeccionRepository seccionRepository;
    @Mock private AlumnoRepository alumnoRepository;
    @Mock private TokenGenerator tokenGenerator;
    @Mock private EmailService emailService;
    @Mock private MatriculaService matriculaService;

    @InjectMocks
    private InvitacionServiceImpl invitacionServiceImpl;

    private Seccion seccionDePrueba;
    private Alumno alumnoDePrueba;
    private InvitacionRequest requestDePrueba;

    @BeforeEach
    void setUp() {

        Persona personaProfesor = new Persona();
        personaProfesor.setNombres("Juan");
        personaProfesor.setApellidoP("Perez");

        Profesor profesor = new Profesor();
        profesor.setIdProfesor(1);
        profesor.setPersona(personaProfesor);

        seccionDePrueba = new Seccion();
        seccionDePrueba.setIdSeccion(18);
        seccionDePrueba.setNombreCurso("Curso de prueba");
        seccionDePrueba.setProfesor(profesor);

        alumnoDePrueba = new Alumno();
        alumnoDePrueba.setIdAlumno(5);

        requestDePrueba = new InvitacionRequest(10, "alumno@test.com");

    }

    @Test
    void crearInvitacion_CaminoFeliz_DebeGuardarYEnviarEmail(){
        Integer idProfesor = 1;
        String tokenGenerado = "uuid-token-123456";

        when(seccionRepository.findById(10)).thenReturn(Optional.of(seccionDePrueba));

        when(invitacionRepository.existsPendingInvitationByCorreoAndSeccion(
                "alumno@test.com",10
        )).thenReturn(false);

        when(alumnoRepository.findByCorreo("alumno@test.com"))
                .thenReturn(Optional.of(alumnoDePrueba));

        when(matriculaService.estaMatriculado(alumnoDePrueba, seccionDePrueba))
                .thenReturn(false);

        when(tokenGenerator.generateToken()).thenReturn(tokenGenerado);

        // Usamos 'any' porque el objeto 'invitacion' se crea DENTRO del método.
        // Usamos 'thenAnswer' para simular que la BD le asigna un ID.
        when(invitacionRepository.save(any(Invitacion.class)))
                .thenAnswer(i -> {
                    Invitacion invGuardada = i.getArgument(0);
                    invGuardada.setIdInvitaciones(99);
                    return invGuardada;
                });

        InvitacionResponse response = invitacionServiceImpl.crearInvitacion(requestDePrueba, idProfesor);

        assertNotNull(response);
        assertEquals(99, response.getIdInvitacion());
        assertEquals("uuid-token-123456", response.getToken());
        assertEquals("Curso de prueba", response.getNombreCurso());
        assertEquals("Juan Perez", response.getNombreProfesor());
        assertEquals(EstadoInvitacion.PENDIENTE.name(), response.getEstado());

        verify(seccionRepository, times(1)).findById(10);
        verify(invitacionRepository, times(1)).save(any(Invitacion.class));
        verify(emailService, times(1)).enviarInvitacion(any(Invitacion.class));
    }

    @Test
    void crearInvitacion_CuandoProfesorNoTienePermisos_DebeLanzarExcepcion() {
        Integer idProfesorIncorrecto = 2;

        when(seccionRepository.findById(10)).thenReturn(Optional.of(seccionDePrueba));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            invitacionServiceImpl.crearInvitacion(requestDePrueba, idProfesorIncorrecto)
        );

        assertEquals("No tienes permisos para invitar alumnos a esta sección", exception.getMessage());

        verify(invitacionRepository, never()).save(any(Invitacion.class));
        verify(emailService, never()).enviarInvitacion(any(Invitacion.class));
    }

}