package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ManualScriptRequest;
import com.medmaxpub.api.model.ManualScript;
import com.medmaxpub.api.service.ManualScriptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/manual-scripts")
@RequiredArgsConstructor
public class AdminManualScriptController {

    private final ManualScriptService manualScriptService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ManualScript create(
            @ModelAttribute ManualScriptRequest request,
            @RequestPart("file") MultipartFile file
    ) {
        return manualScriptService.create(request, file);
    }
}
