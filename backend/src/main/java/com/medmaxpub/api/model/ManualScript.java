package com.medmaxpub.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "manualScripts")
public class ManualScript {
    @Id
    private String id;
    private String title;
    private String category;
    private String description;
    private FileAsset file;
    private Instant createdAt;
}

