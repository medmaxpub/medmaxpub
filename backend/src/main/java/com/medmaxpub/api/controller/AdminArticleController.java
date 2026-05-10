package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ArticleRequest;
import com.medmaxpub.api.model.Article;
import com.medmaxpub.api.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ArticleService articleService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Article createArticle(
            @ModelAttribute ArticleRequest request,
            @RequestPart("pdfFile") MultipartFile pdfFile
    ) {
        return articleService.create(request, pdfFile);
    }
}

