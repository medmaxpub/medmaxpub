package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class JournalRequest {
    private String title;
    private String slug;
    private String issn;
    private String category;
    private String description;
}

