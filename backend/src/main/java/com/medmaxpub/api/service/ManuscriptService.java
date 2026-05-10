package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.ManuscriptRequest;
import com.medmaxpub.api.exception.ResourceNotFoundException;
import com.medmaxpub.api.model.Journal;
import com.medmaxpub.api.model.ManuscriptSubmission;
import com.medmaxpub.api.repository.JournalRepository;
import com.medmaxpub.api.repository.ManuscriptSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManuscriptService {

    private final ManuscriptSubmissionRepository manuscriptSubmissionRepository;
    private final JournalRepository journalRepository;
    private final CloudinaryService cloudinaryService;

    public ManuscriptSubmission submit(ManuscriptRequest request, MultipartFile manuscriptFile) {
        Journal journal = journalRepository.findById(request.getJournalId())
                .orElseThrow(() -> new ResourceNotFoundException("Journal not found"));

        ManuscriptSubmission submission = ManuscriptSubmission.builder()
                .authorName(request.getAuthorName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .journalId(journal.getId())
                .journalTitle(journal.getTitle())
                .manuscriptTitle(request.getManuscriptTitle())
                .message(request.getMessage())
                .status("Submitted")
                .manuscriptFile(cloudinaryService.upload(manuscriptFile, "medmaxpub/manuscripts", "raw"))
                .createdAt(Instant.now())
                .build();
        return manuscriptSubmissionRepository.save(submission);
    }

    public List<ManuscriptSubmission> getAll() {
        return manuscriptSubmissionRepository.findAll();
    }
}

