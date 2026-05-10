package com.medmaxpub.api.dto;

import java.util.List;

public record ArchiveVolumeResponse(
        Integer volume,
        List<ArchiveIssueResponse> issues
) {
}

