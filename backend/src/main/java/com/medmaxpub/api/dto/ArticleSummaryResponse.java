package com.medmaxpub.api.dto;

import java.util.List;

public record ArticleSummaryResponse(
        String id,
        String title,
        List<String> authors,
        String pdfUrl
) {
}

