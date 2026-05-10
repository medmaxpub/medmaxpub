package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.ContactRequest;
import com.medmaxpub.api.model.ContactMessage;
import com.medmaxpub.api.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessage create(ContactRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.name())
                .email(request.email())
                .subject(request.subject())
                .message(request.message())
                .createdAt(Instant.now())
                .build();
        return contactMessageRepository.save(message);
    }

    public List<ContactMessage> getAll() {
        return contactMessageRepository.findAll();
    }
}

