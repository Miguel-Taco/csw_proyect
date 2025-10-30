package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.services.TokenGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UUIDTokenGeneratorTest {

    private TokenGenerator tokenGenerator;

    @BeforeEach
    void setUp() {
     tokenGenerator = new UUIDTokenGenerator();
    }

    @Test
    void testGenerateToken_NoDebeSerNulo(){
        String token = tokenGenerator.generateToken();
        assertNotNull(token, "El token generado no debería ser nulo");
    }

    @Test
    void testGenerateToken_DebeTenerCorrectaLongitud(){
        String token = tokenGenerator.generateToken();
        assertEquals(36, token.length(), "El token UUID debe tener 36 caracteres");
    }

    @Test
    void testGenerateToken_DebeGenerarTokenDiferentesEnCadaLlamada(){
        String token1 = tokenGenerator.generateToken();
        String token2 = tokenGenerator.generateToken();

        assertNotEquals(token2, token1, "Dos tokens generados no deberían ser iguales");
    }
}