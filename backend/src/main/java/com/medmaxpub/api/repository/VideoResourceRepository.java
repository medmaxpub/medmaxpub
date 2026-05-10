package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.VideoResource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VideoResourceRepository extends MongoRepository<VideoResource, String> {
}

