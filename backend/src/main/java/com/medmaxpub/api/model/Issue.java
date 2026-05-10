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
@Document(collection = "issues")
public class Issue {
    @Id
    private String id;
    private String journalId;
    private Integer volume;
    private Integer issueNumber;
    private Integer year;
    private Boolean currentIssue;
    private Instant publishedAt;
}

