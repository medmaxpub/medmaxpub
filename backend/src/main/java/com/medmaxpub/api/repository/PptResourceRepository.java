package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.PptResource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PptResourceRepository extends MongoRepository<PptResource, String> {
}

