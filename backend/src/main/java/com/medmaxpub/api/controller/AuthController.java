package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.AuthResponse;
import com.medmaxpub.api.dto.LoginRequest;
import com.medmaxpub.api.dto.RegisterAdminRequest;
import com.medmaxpub.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register-admin")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterAdminRequest request) {
        return authService.register(request);
    }
}

