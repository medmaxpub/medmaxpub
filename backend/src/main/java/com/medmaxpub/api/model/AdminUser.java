package com.medmaxpub.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "adminUsers")
public class AdminUser {
    @Id
    private String id;
    private String name;
    private String email;
    @JsonIgnore
    private String password;
    private Set<String> roles;
    private Instant createdAt;
}

