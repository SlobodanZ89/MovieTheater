package com.example.kino.DTO.response;

import com.example.kino.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AuthResponseDTO {
    private String token;
    private String username;
    private Role role;
}

