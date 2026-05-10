package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class JournalSectionRequest {
    private String home;
    private String about;
    private String aimScope;
    private String editorialBoard;
    private String authorGuidelines;
    private String articleInPress;
}

