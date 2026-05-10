package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.JournalSection;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface JournalSectionRepository extends MongoRepository<JournalSection, String> {
    Optional<JournalSection> findByJournalId(String journalId);
}

