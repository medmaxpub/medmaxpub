package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ArticleSummaryResponse;
import com.medmaxpub.api.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping("/{id}/articles")
    public List<ArticleSummaryResponse> getArticles(@PathVariable String id) {
        return issueService.getArticles(id);
    }
}

