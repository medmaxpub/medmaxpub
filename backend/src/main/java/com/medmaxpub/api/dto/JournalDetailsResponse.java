package com.medmaxpub.api.dto;

import java.util.List;
import java.util.Map;

public record JournalDetailsResponse(
        String id,
        String slug,
        String title,
        String issn,
        String category,
        String description,
        String coverImageUrl,
        Map<String, String> sections,
        IssueResponse currentIssue,
        List<ArchiveYearResponse> archive
) {
}

