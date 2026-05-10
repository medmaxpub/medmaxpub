package com.medmaxpub.api.dto;

import lombok.Data;

@Data
public class VideoRequest {
    private String title;
    private String description;
    private String youtubeUrl;
}

