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
@Document(collection = "manuscriptSubmissions")
public class ManuscriptSubmission {
    @Id
    private String id;
    private String authorName;
    private String email;
    private String phone;
    private String journalId;
    private String journalTitle;
    private String manuscriptTitle;
    private String message;
    private String status;
    private FileAsset manuscriptFile;
    private Instant createdAt;
}

