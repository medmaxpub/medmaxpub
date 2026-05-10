package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.ManualScript;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ManualScriptRepository extends MongoRepository<ManualScript, String> {
}

