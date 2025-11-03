package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.dto.RegistroRequest;
import com.unmsm.scorely.exception.RegistroCodigoEstudiante;
import com.unmsm.scorely.exception.RegistroCodigoExistente;
import com.unmsm.scorely.exception.RegistroCorreoExistente;
import com.unmsm.scorely.exception.RegistroUsuarioInvalido;
import com.unmsm.scorely.models.Alumno;
import com.unmsm.scorely.models.Persona;
import com.unmsm.scorely.models.Profesor;
import com.unmsm.scorely.repository.AlumnoRepository;
import com.unmsm.scorely.repository.PersonaRepository;
import com.unmsm.scorely.repository.ProfesorRepository;
import com.unmsm.scorely.services.RegistroService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistroServiceImpl implements RegistroService {

    private final PersonaRepository personaRepository;
    private final AlumnoRepository alumnoRepository;
    private final ProfesorRepository profesorRepository;

    @Override
    @Transactional
    public Persona registrar(RegistroRequest request) {

        // Validar correo duplicado
        if (personaRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RegistroCorreoExistente();
        }

        // Validar código de estudiante si el tipo de usuario es "Estudiante"
        if ("Estudiante".equalsIgnoreCase(request.getTipoUsuario())) {
            if (request.getCodigoEstudiante() == null || request.getCodigoEstudiante().trim().isEmpty()) {
                throw new RegistroCodigoEstudiante();
            }
            if (alumnoRepository.findByCodigoAlumno(request.getCodigoEstudiante()).isPresent()) {
                throw new RegistroCodigoExistente();
            }
        }

        // Crear Persona
        Persona persona = new Persona();
        persona.setNombres(request.getNombres());
        persona.setApellidoP(request.getApellidoP());
        persona.setApellidoM(request.getApellidoM());
        persona.setCorreo(request.getCorreo());
        // Se guarda la contraseña en texto plano (como estaba originalmente)
        persona.setContrasena(request.getContrasena());

        Persona personaGuardada = personaRepository.save(persona);

        // --- LÓGICA CORREGIDA ---
        // Crear Alumno o Profesor según el tipoUsuario
        if ("Estudiante".equalsIgnoreCase(request.getTipoUsuario())) {
            Alumno alumno = new Alumno();
            alumno.setPersona(personaGuardada);
            alumno.setCodigoAlumno(request.getCodigoEstudiante());
            alumnoRepository.save(alumno);
        } else if ("Profesor".equalsIgnoreCase(request.getTipoUsuario())) {
            Profesor profesor = new Profesor();
            profesor.setPersona(personaGuardada);
            profesorRepository.save(profesor);
        } else {
            // Manejar un caso inesperado para evitar errores silenciosos
            throw new RegistroUsuarioInvalido("Tipo de usuario no válido: " + request.getTipoUsuario());
        }

        return personaGuardada;
    }
}