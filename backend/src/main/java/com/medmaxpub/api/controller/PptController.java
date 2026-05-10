package com.medmaxpub.api.controller;

import com.medmaxpub.api.model.PptResource;
import com.medmaxpub.api.service.PptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ppt")
@RequiredArgsConstructor
public class PptController {

    private final PptService pptService;

    @GetMapping
    public List<PptResource> getAll() {
        return pptService.getAll();
    }

    @GetMapping("/{id}")
    public PptResource getById(@PathVariable String id) {
        return pptService.getById(id);
    }
}

