package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.ManualScriptRequest;
import com.medmaxpub.api.model.ManualScript;
import com.medmaxpub.api.repository.ManualScriptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManualScriptService {

    private final ManualScriptRepository manualScriptRepository;
    private final CloudinaryService cloudinaryService;

    public ManualScript create(ManualScriptRequest request, MultipartFile file) {
        ManualScript manualScript = ManualScript.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .description(request.getDescription())
                .file(cloudinaryService.upload(file, "medmaxpub/manual-scripts", "raw"))
                .createdAt(Instant.now())
                .build();
        return manualScriptRepository.save(manualScript);
    }

    public List<ManualScript> getAll() {
        return manualScriptRepository.findAll();
    }
}

