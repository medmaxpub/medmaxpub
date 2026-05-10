package com.medmaxpub.api.repository;

import com.medmaxpub.api.model.Testimonial;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestimonialRepository extends MongoRepository<Testimonial, String> {
}

