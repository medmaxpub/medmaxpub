package com.medmaxpub.api.config;

import com.medmaxpub.api.model.AdminUser;
import com.medmaxpub.api.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email}")
    private String bootstrapEmail;

    @Value("${app.bootstrap.admin-password}")
    private String bootstrapPassword;

    @Override
    public void run(String... args) {
        if (!adminUserRepository.existsByEmail(bootstrapEmail)) {
            AdminUser adminUser = AdminUser.builder()
                    .name("Platform Administrator")
                    .email(bootstrapEmail)
                    .password(passwordEncoder.encode(bootstrapPassword))
                    .roles(Set.of("ROLE_ADMIN"))
                    .createdAt(Instant.now())
                    .build();
            adminUserRepository.save(adminUser);
        }
    }
}

