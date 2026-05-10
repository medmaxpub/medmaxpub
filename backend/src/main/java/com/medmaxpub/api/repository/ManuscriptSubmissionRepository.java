package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.ManuscriptSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ManuscriptSubmissionRepository extends MongoRepository<ManuscriptSubmission, String> {
}

