package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.dto.LoginResponse;
import com.unmsm.scorely.repository.PersonaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PersonaUserRepository personaUserRepository;

    public LoginResponse login(String correo, String contraseña) {
        return personaUserRepository.login(correo, contraseña)
                .map(user -> {
                    if (user.getTipo() != null) {
                        user.setTipo(user.getTipo().toLowerCase());
                    }
                    return new LoginResponse(true, "Login exitoso", user);
                })
                .orElse(new LoginResponse(false, "Credenciales inválidas", null));
    }
}