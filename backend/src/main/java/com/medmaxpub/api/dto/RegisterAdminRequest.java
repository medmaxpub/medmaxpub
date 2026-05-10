package com.medmaxpub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterAdminRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password
) {
}

