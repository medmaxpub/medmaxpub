package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ManuscriptRequest;
import com.medmaxpub.api.model.ManuscriptSubmission;
import com.medmaxpub.api.service.ManuscriptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ManuscriptController {

    private final ManuscriptService manuscriptService;

    @PostMapping(value = "/api/manuscript/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ManuscriptSubmission submit(
            @ModelAttribute ManuscriptRequest request,
            @RequestPart("manuscriptFile") MultipartFile manuscriptFile
    ) {
        return manuscriptService.submit(request, manuscriptFile);
    }

    @GetMapping("/api/admin/manuscripts")
    public List<ManuscriptSubmission> getAll() {
        return manuscriptService.getAll();
    }
}

