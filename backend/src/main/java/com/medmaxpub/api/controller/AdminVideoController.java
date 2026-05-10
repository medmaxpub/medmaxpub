package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.VideoRequest;
import com.medmaxpub.api.model.VideoResource;
import com.medmaxpub.api.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/videos")
@RequiredArgsConstructor
public class AdminVideoController {

    private final VideoService videoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public VideoResource createVideo(
            @ModelAttribute VideoRequest request,
            @RequestPart(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestPart(value = "thumbnailFile", required = false) MultipartFile thumbnailFile
    ) {
        return videoService.create(request, videoFile, thumbnailFile);
    }
}

