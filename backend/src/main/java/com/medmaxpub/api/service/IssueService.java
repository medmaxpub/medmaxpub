package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.ArticleSummaryResponse;
import com.medmaxpub.api.dto.IssueRequest;
import com.medmaxpub.api.exception.ResourceNotFoundException;
import com.medmaxpub.api.model.Issue;
import com.medmaxpub.api.repository.ArticleRepository;
import com.medmaxpub.api.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ArticleRepository articleRepository;

    public Issue create(IssueRequest request) {
        Issue issue = Issue.builder()
                .journalId(request.getJournalId())
                .volume(request.getVolume())
                .issueNumber(request.getIssueNumber())
                .year(request.getYear())
                .currentIssue(Boolean.TRUE.equals(request.getCurrentIssue()))
                .publishedAt(Instant.now())
                .build();
        return issueRepository.save(issue);
    }

    public List<ArticleSummaryResponse> getArticles(String issueId) {
        issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        return articleRepository.findByIssueId(issueId).stream()
                .map(article -> new ArticleSummaryResponse(
                        article.getId(),
                        article.getTitle(),
                        article.getAuthors(),
                        article.getPdfFile() != null ? article.getPdfFile().getSecureUrl() : null
                ))
                .toList();
    }
}

