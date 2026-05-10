package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.Article;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ArticleRepository extends MongoRepository<Article, String> {
    List<Article> findByIssueId(String issueId);
    List<Article> findByJournalId(String journalId);
}

