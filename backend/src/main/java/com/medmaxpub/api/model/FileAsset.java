package com.medmaxpub.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileAsset {
    private String publicId;
    private String secureUrl;
    private String originalFilename;
    private String fileType;
    private String resourceType;
    private String format;
    private Long fileSize;
    private Instant uploadedAt;
}

