package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.IssueRequest;
import com.medmaxpub.api.model.Issue;
import com.medmaxpub.api.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/issues")
@RequiredArgsConstructor
public class AdminIssueController {

    private final IssueService issueService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Issue createIssue(@RequestBody IssueRequest request) {
        return issueService.create(request);
    }
}

