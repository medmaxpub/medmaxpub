package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.TestimonialRequest;
import com.medmaxpub.api.model.Testimonial;
import com.medmaxpub.api.service.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/testimonials")
@RequiredArgsConstructor
public class AdminTestimonialController {

    private final TestimonialService testimonialService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Testimonial create(@RequestBody TestimonialRequest request) {
        return testimonialService.create(request);
    }
}

