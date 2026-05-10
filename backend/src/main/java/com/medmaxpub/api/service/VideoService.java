package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.VideoRequest;
import com.medmaxpub.api.model.VideoResource;
import com.medmaxpub.api.repository.VideoResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoResourceRepository videoResourceRepository;
    private final CloudinaryService cloudinaryService;

    public VideoResource create(VideoRequest request, MultipartFile videoFile, MultipartFile thumbnailFile) {
        VideoResource resource = VideoResource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .youtubeUrl(request.getYoutubeUrl())
                .videoFile(cloudinaryService.upload(videoFile, "medmaxpub/videos", "video"))
                .thumbnailFile(cloudinaryService.upload(thumbnailFile, "medmaxpub/videos", "image"))
                .createdAt(Instant.now())
                .build();
        return videoResourceRepository.save(resource);
    }

    public List<VideoResource> getAll() {
        return videoResourceRepository.findAll();
    }
}

