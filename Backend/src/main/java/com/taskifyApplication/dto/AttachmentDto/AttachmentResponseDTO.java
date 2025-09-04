package com.taskifyApplication.dto.AttachmentDto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class AttachmentResponseDTO {
    private Long id;
    private String filename;
    private String originalName;
    private String mimeType;
    private Long size;
    private String storageUrl;
    private String thumbnailUrl;
    private OffsetDateTime uploadedAt;
    private String uploadedByName;
    private Long uploadedById;
    private String description;
    private Integer version;
    private Boolean isLatestVersion;
}