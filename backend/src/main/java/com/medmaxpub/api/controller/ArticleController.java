package com.medmaxpub.api.controller;

import com.medmaxpub.api.model.Article;
import com.medmaxpub.api.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping("/{id}")
    public Article getArticle(@PathVariable String id) {
        return articleService.getById(id);
    }
}

