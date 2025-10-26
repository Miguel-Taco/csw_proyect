package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.models.Alumno;
import com.unmsm.scorely.models.AlumnoSeccion;
import com.unmsm.scorely.models.Seccion;
import com.unmsm.scorely.repository.AlumnoSeccionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatriculaServiceImplTest {

    //Simularemos esta dependencia
    @Mock
    private AlumnoSeccionRepository alumnoSeccionRepository;

    // Mockito intentará inyectar los @Mock(del repositorio)
    // dentro de esta instancia
    @InjectMocks
    private MatriculaServiceImpl matriculaService;

    // (No necesitamos un @BeforeEach que haga "new"
    // porque @InjectMocks y @ExtendWith lo hacen por nosotros)

    @Test
    void testEstaMatriculado_CuandoAlumnoExiste_DebeRetornarTrue(){
        Alumno alumno = new Alumno();
        alumno.setIdAlumno(1);
        Seccion seccion = new Seccion();
        seccion.setIdSeccion(10);

        // Dar indicaciones a mokito para q simule correctamente
        when(alumnoSeccionRepository.existsByAlumnoAndSeccion(1,10))
                .thenReturn(true);

        boolean resultado = matriculaService.estaMatriculado(alumno, seccion);

        assertTrue(resultado, "El método debió retornar true porque el alumno existe");

        // Opcional, es para verificar si el mockito fue llamado
        verify(alumnoSeccionRepository, times(1)).existsByAlumnoAndSeccion(1,10);
    }

    @Test
    void testEstaMatriculado_CuandoAlumnoNoExiste_DebeRetornarFalse(){
        Alumno alumno = new Alumno();
        alumno.setIdAlumno(2);
        Seccion seccion = new Seccion();
        seccion.setIdSeccion(20);

        when(alumnoSeccionRepository.existsByAlumnoAndSeccion(2, 20))
                .thenReturn(false);

        boolean resultado = matriculaService.estaMatriculado(alumno, seccion);

        assertFalse(resultado, "El método debió retornar false porque el alumno no existe");

        verify(alumnoSeccionRepository).existsByAlumnoAndSeccion(2, 20); // times(1) es el default
    }

    @Test
    void testMatricularAlumno_DebeLlamarASaveDelRespositorio(){
        Alumno alumno = new Alumno();
        alumno.setIdAlumno(5);

        Seccion seccion = new Seccion();
        seccion.setIdSeccion(50);

        ArgumentCaptor<AlumnoSeccion> captor = ArgumentCaptor.forClass(AlumnoSeccion.class);

        matriculaService.matricularAlumno(alumno, seccion);

        verify(alumnoSeccionRepository, times(1)).save(captor.capture());

        AlumnoSeccion alumnoSeccionGuardado = captor.getValue();
        assertNotNull(alumnoSeccionGuardado);
        assertEquals(alumno.getIdAlumno(), alumnoSeccionGuardado.getAlumno().getIdAlumno());
        assertEquals(seccion.getIdSeccion(), alumnoSeccionGuardado.getSeccion().getIdSeccion());
    }
}