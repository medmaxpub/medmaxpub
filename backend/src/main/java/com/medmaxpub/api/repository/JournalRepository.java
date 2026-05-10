package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.Journal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface JournalRepository extends MongoRepository<Journal, String> {
    Optional<Journal> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

