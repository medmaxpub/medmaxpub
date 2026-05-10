package com.medmaxpub.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "journalSections")
public class JournalSection {
    @Id
    private String id;
    private String journalId;
    private String home;
    private String about;
    private String aimScope;
    private String editorialBoard;
    private String authorGuidelines;
    private String articleInPress;
    private Instant updatedAt;
}

