package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.Issue;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IssueRepository extends MongoRepository<Issue, String> {
    List<Issue> findByJournalIdOrderByYearDescVolumeDescIssueNumberDesc(String journalId);
}

