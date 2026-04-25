package com.example.kino.controller;

import com.example.kino.DTO.request.LoginRequestDTO;
import com.example.kino.DTO.request.RegisterRequestDTO;
import com.example.kino.DTO.response.AuthResponseDTO;
import com.example.kino.entity.AppUser;
import com.example.kino.enums.Role;
import com.example.kino.repositories.AppUserRepository;
import com.example.kino.security.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
        }
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        appUserRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), Map.of("role", user.getRole().name()));
        return new ResponseEntity<>(new AuthResponseDTO(token, user.getUsername(), user.getRole()), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String username = auth.getName();
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials"));

        String token = jwtService.generateToken(user.getUsername(), Map.of("role", user.getRole().name()));
        return new AuthResponseDTO(token, user.getUsername(), user.getRole());
    }
}

