package com.medmaxpub.api.controller;

import com.medmaxpub.api.model.VideoResource;
import com.medmaxpub.api.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    @GetMapping
    public List<VideoResource> getAll() {
        return videoService.getAll();
    }
}

