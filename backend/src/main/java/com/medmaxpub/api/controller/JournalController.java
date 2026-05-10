package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ArchiveYearResponse;
import com.medmaxpub.api.dto.IssueResponse;
import com.medmaxpub.api.dto.JournalDetailsResponse;
import com.medmaxpub.api.dto.JournalSummaryResponse;
import com.medmaxpub.api.service.JournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping
    public List<JournalSummaryResponse> getAllJournals() {
        return journalService.getAll();
    }

    @GetMapping("/{slug}")
    public JournalDetailsResponse getJournalBySlug(@PathVariable String slug) {
        return journalService.getBySlug(slug);
    }

    @GetMapping("/{id}/sections")
    public Map<String, String> getSections(@PathVariable String id) {
        return journalService.getSections(id);
    }

    @GetMapping("/{id}/issues")
    public List<IssueResponse> getIssues(@PathVariable String id) {
        return journalService.getIssues(id);
    }

    @GetMapping("/{id}/archive")
    public List<ArchiveYearResponse> getArchive(@PathVariable String id) {
        return journalService.getArchive(id);
    }
}

