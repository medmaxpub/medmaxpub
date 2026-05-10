package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.TestimonialRequest;
import com.medmaxpub.api.model.Testimonial;
import com.medmaxpub.api.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;

    public Testimonial create(TestimonialRequest request) {
        Testimonial testimonial = Testimonial.builder()
                .name(request.getName())
                .role(request.getRole())
                .message(request.getMessage())
                .createdAt(Instant.now())
                .build();
        return testimonialRepository.save(testimonial);
    }

    public List<Testimonial> getAll() {
        return testimonialRepository.findAll();
    }
}

