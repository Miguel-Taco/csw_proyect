package com.unmsm.scorely.controllers;

import com.unmsm.scorely.dto.LoginRequest;
import com.unmsm.scorely.dto.LoginResponse;
import com.unmsm.scorely.services.imp.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }
}
