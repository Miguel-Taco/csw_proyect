package com.unmsm.scorely.services.imp;

import com.unmsm.scorely.services.TokenGenerator;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UUIDTokenGenerator implements TokenGenerator {
    @Override
    public String generateToken() {
        return UUID.randomUUID().toString();
    }
}
