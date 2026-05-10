package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class ManuscriptRequest {
    private String authorName;
    private String email;
    private String phone;
    private String journalId;
    private String manuscriptTitle;
    private String message;
}

