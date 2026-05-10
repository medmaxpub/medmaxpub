package com.medmaxpub.api.dto;

import java.util.List;

public record ArchiveYearResponse(
        Integer year,
        List<ArchiveVolumeResponse> volumes
) {
}

