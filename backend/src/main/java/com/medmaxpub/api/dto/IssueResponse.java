package com.medmaxpub.api.dto;

import java.util.List;

public record IssueResponse(
        String id,
        Integer volume,
        Integer issue,
        Integer year,
        List<ArticleSummaryResponse> articles
) {
}

