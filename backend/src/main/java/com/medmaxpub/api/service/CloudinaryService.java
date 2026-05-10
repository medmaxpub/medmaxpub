package com.medmaxpub.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.medmaxpub.api.model.FileAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public FileAsset upload(MultipartFile file, String folder, String resourceType) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType == null ? "auto" : resourceType,
                    "use_filename", true,
                    "unique_filename", true
            ));
            Number bytes = result.get("bytes") instanceof Number number ? number : 0L;

            return FileAsset.builder()
                    .publicId((String) result.get("public_id"))
                    .secureUrl((String) result.get("secure_url"))
                    .originalFilename(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .resourceType((String) result.get("resource_type"))
                    .format((String) result.get("format"))
                    .fileSize(bytes.longValue())
                    .uploadedAt(Instant.now())
                    .build();
        } catch (IOException exception) {
            throw new RuntimeException("Failed to upload file to Cloudinary", exception);
        }
    }

    public void delete(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", resourceType == null ? "image" : resourceType
            ));
        } catch (IOException exception) {
            throw new RuntimeException("Failed to delete Cloudinary asset", exception);
        }
    }
}
