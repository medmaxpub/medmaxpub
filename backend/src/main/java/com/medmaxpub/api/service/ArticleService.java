package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.ArticleRequest;
import com.medmaxpub.api.exception.ResourceNotFoundException;
import com.medmaxpub.api.model.Article;
import com.medmaxpub.api.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final CloudinaryService cloudinaryService;

    public Article create(ArticleRequest request, MultipartFile pdfFile) {
        List<String> authors = request.getAuthors() == null
                ? List.of()
                : Arrays.stream(request.getAuthors().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();

        Article article = Article.builder()
                .journalId(request.getJournalId())
                .issueId(request.getIssueId())
                .title(request.getTitle())
                .authors(authors)
                .articleType(request.getArticleType())
                .abstractText(request.getAbstractText())
                .inPress(Boolean.TRUE.equals(request.getInPress()))
                .pdfFile(cloudinaryService.upload(pdfFile, "medmaxpub/articles", "raw"))
                .publishedAt(Instant.now())
                .build();
        return articleRepository.save(article);
    }

    public Article getById(String id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));
    }
}

