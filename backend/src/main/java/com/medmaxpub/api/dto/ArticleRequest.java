package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class ArticleRequest {
    private String journalId;
    private String issueId;
    private String title;
    private String authors;
    private String articleType;
    private String abstractText;
    private Boolean inPress;
}

