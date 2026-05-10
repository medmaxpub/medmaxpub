package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.PptRequest;
import com.medmaxpub.api.model.PptResource;
import com.medmaxpub.api.service.PptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/ppt")
@RequiredArgsConstructor
public class AdminPptController {

    private final PptService pptService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public PptResource upload(
            @ModelAttribute PptRequest request,
            @RequestPart("pptFile") MultipartFile pptFile,
            @RequestPart(value = "pdfPreviewFile", required = false) MultipartFile pdfPreviewFile
    ) {
        return pptService.create(request, pptFile, pdfPreviewFile);
    }
}

