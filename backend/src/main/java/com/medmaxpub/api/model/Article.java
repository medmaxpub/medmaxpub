package com.medmaxpub.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "articles")
public class Article {
    @Id
    private String id;
    private String journalId;
    private String issueId;
    private String title;
    private List<String> authors;
    private String articleType;
    private String abstractText;
    private Boolean inPress;
    private FileAsset pdfFile;
    private Instant publishedAt;
}

