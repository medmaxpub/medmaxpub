package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.AuthResponse;
import com.medmaxpub.api.dto.LoginRequest;
import com.medmaxpub.api.dto.RegisterAdminRequest;
import com.medmaxpub.api.model.AdminUser;
import com.medmaxpub.api.repository.AdminUserRepository;
import com.medmaxpub.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterAdminRequest request) {
        AdminUser adminUser = AdminUser.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of("ROLE_ADMIN"))
                .createdAt(Instant.now())
                .build();
        AdminUser savedUser = adminUserRepository.save(adminUser);

        String token = jwtService.generateToken(User.builder()
                .username(savedUser.getEmail())
                .password(savedUser.getPassword())
                .roles("ADMIN")
                .build());

        return new AuthResponse(token, new AuthResponse.UserSummary(savedUser.getId(), savedUser.getName(), savedUser.getEmail()));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        AdminUser adminUser = adminUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        String token = jwtService.generateToken(User.builder()
                .username(adminUser.getEmail())
                .password(adminUser.getPassword())
                .roles("ADMIN")
                .build());

        return new AuthResponse(token, new AuthResponse.UserSummary(adminUser.getId(), adminUser.getName(), adminUser.getEmail()));
    }
}

