package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.JournalRequest;
import com.medmaxpub.api.dto.JournalSectionRequest;
import com.medmaxpub.api.dto.JournalSummaryResponse;
import com.medmaxpub.api.service.JournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/journals")
@RequiredArgsConstructor
public class AdminJournalController {

    private final JournalService journalService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public JournalSummaryResponse createJournal(
            @ModelAttribute JournalRequest request,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        return journalService.create(request, coverImage);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public JournalSummaryResponse updateJournal(
            @PathVariable String id,
            @ModelAttribute JournalRequest request,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        return journalService.update(id, request, coverImage);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteJournal(@PathVariable String id) {
        journalService.delete(id);
    }

    @PutMapping("/{id}/sections")
    public Map<String, String> updateSections(@PathVariable String id, @RequestBody JournalSectionRequest request) {
        return journalService.updateSections(id, request);
    }
}

