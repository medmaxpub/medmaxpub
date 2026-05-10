package com.medmaxpub.api.controller;

import com.medmaxpub.api.dto.ContactRequest;
import com.medmaxpub.api.model.ContactMessage;
import com.medmaxpub.api.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/api/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessage create(@Valid @RequestBody ContactRequest request) {
        return contactService.create(request);
    }

    @GetMapping("/api/admin/contact")
    public List<ContactMessage> getAll() {
        return contactService.getAll();
    }
}

