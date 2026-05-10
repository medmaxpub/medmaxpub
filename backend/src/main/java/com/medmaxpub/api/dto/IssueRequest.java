package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class IssueRequest {
    private String journalId;
    private Integer volume;
    private Integer issueNumber;
    private Integer year;
    private Boolean currentIssue;
}

