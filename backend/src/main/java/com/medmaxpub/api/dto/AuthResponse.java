package com.medmaxpub.api.dto;

public record AuthResponse(String token, UserSummary user) {
    public record UserSummary(String id, String name, String email) {
    }
}

