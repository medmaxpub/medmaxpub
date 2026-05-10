package com.medmaxpub.api.dto;

public record JournalSummaryResponse(
        String id,
        String slug,
        String title,
        String issn,
        String category,
        String description,
        String coverImageUrl
) {
}

