package com.medmaxpub.api.dto;

import java.util.List;

public record ArchiveIssueResponse(
        String id,
        Integer issue,
        List<ArticleSummaryResponse> articles
) {
}

