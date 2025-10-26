package com.unmsm.scorely.dto;

import com.unmsm.scorely.models.PersonaUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private PersonaUser user;
}

