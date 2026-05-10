package com.medmaxpub.api.controller;

import com.medmaxpub.api.model.Testimonial;
import com.medmaxpub.api.service.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonials")
@RequiredArgsConstructor
public class TestimonialController {

    private final TestimonialService testimonialService;

    @GetMapping
    public List<Testimonial> getAll() {
        return testimonialService.getAll();
    }
}

