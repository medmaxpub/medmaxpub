package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.PptRequest;
import com.medmaxpub.api.exception.ResourceNotFoundException;
import com.medmaxpub.api.model.PptResource;
import com.medmaxpub.api.repository.PptResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PptService {

    private final PptResourceRepository pptResourceRepository;
    private final CloudinaryService cloudinaryService;

    public PptResource create(PptRequest request, MultipartFile pptFile, MultipartFile pdfPreviewFile) {
        PptResource resource = PptResource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .pptFile(cloudinaryService.upload(pptFile, "medmaxpub/ppts", "raw"))
                .pdfPreviewFile(cloudinaryService.upload(pdfPreviewFile, "medmaxpub/ppts-previews", "raw"))
                .uploadedDate(Instant.now())
                .build();
        return pptResourceRepository.save(resource);
    }

    public List<PptResource> getAll() {
        return pptResourceRepository.findAll();
    }

    public PptResource getById(String id) {
        return pptResourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PPT resource not found"));
    }
}

