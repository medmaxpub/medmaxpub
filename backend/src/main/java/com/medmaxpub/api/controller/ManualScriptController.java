package com.medmaxpub.api.controller;

import com.medmaxpub.api.model.ManualScript;
import com.medmaxpub.api.service.ManualScriptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manual-scripts")
@RequiredArgsConstructor
public class ManualScriptController {

    private final ManualScriptService manualScriptService;

    @GetMapping
    public List<ManualScript> getAll() {
        return manualScriptService.getAll();
    }
}

