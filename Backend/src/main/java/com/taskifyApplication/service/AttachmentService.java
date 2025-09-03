package com.taskifyApplication.service;

import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:50MB}")
    private String maxFileSize;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final Set<String> PREVIEWABLE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
        "application/pdf", "text/plain", "text/csv", "application/json"
    );

    /**
     * Upload a new attachment
     */
    public Attachment uploadAttachment(MultipartFile file, Long taskId, Long workspaceId, 
                                     String description, User uploadedBy) {
        validateFile(file);
        
        Task task = null;
        Workspace workspace = null;
        
        if (taskId != null) {
            task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
            workspace = task.getWorkspace();
        } else if (workspaceId != null) {
            workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        } else {
            throw new RuntimeException("Either taskId or workspaceId must be provided");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            file.transferTo(filePath.toFile());

            // Generate thumbnail for images
            String thumbnailUrl = null;
            if (ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
                thumbnailUrl = generateThumbnail(filePath, uniqueFilename);
            }

            // Create attachment entity
            Attachment attachment = Attachment.builder()
                .filename(uniqueFilename)
                .originalName(originalFilename)
                .mimeType(file.getContentType())
                .size(file.getSize())
                .storageUrl(filePath.toString())
                .thumbnailUrl(thumbnailUrl)
                .uploadedBy(uploadedBy)
                .task(task)
                .workspace(workspace)
                .description(description)
                .version(1)
                .isLatestVersion(true)
                .build();

            return attachmentRepository.save(attachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    /**
     * Upload new version of existing attachment
     */
    public Attachment uploadNewVersion(Long attachmentId, MultipartFile file, 
                                     String changelog, User uploadedBy) {
        Attachment parentAttachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));

        validateFile(file);

        try {
            // Mark current version as not latest
            parentAttachment.setIsLatestVersion(false);
            attachmentRepository.save(parentAttachment);

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            file.transferTo(filePath.toFile());

            // Generate thumbnail for images
            String thumbnailUrl = null;
            if (ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
                thumbnailUrl = generateThumbnail(filePath, uniqueFilename);
            }

            // Create new version
            Attachment newVersion = Attachment.builder()
                .filename(uniqueFilename)
                .originalName(originalFilename)
                .mimeType(file.getContentType())
                .size(file.getSize())
                .storageUrl(filePath.toString())
                .thumbnailUrl(thumbnailUrl)
                .uploadedBy(uploadedBy)
                .task(parentAttachment.getTask())
                .workspace(parentAttachment.getWorkspace())
                .description(changelog)
                .version(parentAttachment.getVersion() + 1)
                .isLatestVersion(true)
                .parentAttachment(parentAttachment)
                .build();

            return attachmentRepository.save(newVersion);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload new version", e);
        }
    }

    /**
     * Get attachments with filters
     */
    public Page<Attachment> getAttachments(AttachmentFilters filters, Pageable pageable) {
        return attachmentRepository.findWithFilters(
            filters.getTaskId(),
            filters.getMimeType(),
            filters.getFromDate(),
            filters.getToDate(),
            pageable
        );
    }

    /**
     * Get attachment by ID
     */
    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    /**
     * Get attachment versions
     */
    public List<Attachment> getAttachmentVersions(Long attachmentId) {
        Attachment attachment = getAttachment(attachmentId);
        
        // If this is a version, get the parent
        Attachment parentAttachment = attachment.getParentAttachment() != null ? 
            attachment.getParentAttachment() : attachment;
        
        return attachmentRepository.findByParentAttachmentOrderByVersionAsc(parentAttachment);
    }

    /**
     * Delete attachment
     */
    public void deleteAttachment(Long id, User user) {
        Attachment attachment = getAttachment(id);
        
        // Check permissions
        if (!canUserDeleteAttachment(attachment, user)) {
            throw new RuntimeException("Permission denied");
        }

        try {
            // Delete file from storage
            Path filePath = Paths.get(attachment.getStorageUrl());
            Files.deleteIfExists(filePath);

            // Delete thumbnail if exists
            if (attachment.getThumbnailUrl() != null) {
                Path thumbnailPath = Paths.get(attachment.getThumbnailUrl());
                Files.deleteIfExists(thumbnailPath);
            }

            // Delete database record
            attachmentRepository.delete(attachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete attachment files", e);
        }
    }

    /**
     * Get file content for download
     */
    public FileDownloadInfo getFileForDownload(Long id) {
        Attachment attachment = getAttachment(id);
        
        try {
            Path filePath = Paths.get(attachment.getStorageUrl());
            byte[] content = Files.readAllBytes(filePath);
            
            return new FileDownloadInfo(
                content,
                attachment.getOriginalName(),
                attachment.getMimeType()
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    /**
     * Generate thumbnail for image files
     */
    private String generateThumbnail(Path originalFile, String filename) {
        try {
            Path thumbnailDir = Paths.get(uploadDir, "thumbnails");
            if (!Files.exists(thumbnailDir)) {
                Files.createDirectories(thumbnailDir);
            }

            String thumbnailFilename = "thumb_" + filename;
            Path thumbnailPath = thumbnailDir.resolve(thumbnailFilename);

            Thumbnails.of(originalFile.toFile())
                .size(200, 200)
                .toFile(thumbnailPath.toFile());

            return thumbnailPath.toString();
        } catch (IOException e) {
            System.err.println("Failed to generate thumbnail: " + e.getMessage());
            return null;
        }
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()) {
            throw new RuntimeException("File name is required");
        }

        // Check file size (50MB default)
        long maxSizeBytes = parseFileSize(maxFileSize);
        if (file.getSize() > maxSizeBytes) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }

        // Check for dangerous file types
        String contentType = file.getContentType();
        if (contentType != null && isDangerousFileType(contentType)) {
            throw new RuntimeException("File type not allowed for security reasons");
        }
    }

    /**
     * Check if user can delete attachment
     */
    private boolean canUserDeleteAttachment(Attachment attachment, User user) {
        // Owner can delete
        if (attachment.getUploadedBy().equals(user)) {
            return true;
        }

        // Workspace admin/owner can delete
        Workspace workspace = attachment.getWorkspace();
        if (workspace != null) {
            RoleEnum userRole = workspace.getUserRole(user);
            return userRole == RoleEnum.ADMIN || userRole == RoleEnum.OWNER;
        }

        return false;
    }

    /**
     * Check if file type is dangerous
     */
    private boolean isDangerousFileType(String contentType) {
        Set<String> dangerousTypes = Set.of(
            "application/x-executable",
            "application/x-msdownload",
            "application/x-msdos-program",
            "text/javascript",
            "application/javascript"
        );
        
        return dangerousTypes.contains(contentType);
    }

    /**
     * Parse file size string (e.g., "50MB") to bytes
     */
    private long parseFileSize(String sizeStr) {
        if (sizeStr == null || sizeStr.isBlank()) {
            return 50 * 1024 * 1024; // 50MB default
        }

        sizeStr = sizeStr.toUpperCase().trim();
        long multiplier = 1;

        if (sizeStr.endsWith("KB")) {
            multiplier = 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("MB")) {
            multiplier = 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        } else if (sizeStr.endsWith("GB")) {
            multiplier = 1024 * 1024 * 1024;
            sizeStr = sizeStr.substring(0, sizeStr.length() - 2);
        }

        try {
            return Long.parseLong(sizeStr.trim()) * multiplier;
        } catch (NumberFormatException e) {
            return 50 * 1024 * 1024; // 50MB default on error
        }
    }

    // Helper classes
    public static class AttachmentFilters {
        private Long taskId;
        private String mimeType;
        private OffsetDateTime fromDate;
        private OffsetDateTime toDate;

        // Getters and setters
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
        public OffsetDateTime getFromDate() { return fromDate; }
        public void setFromDate(OffsetDateTime fromDate) { this.fromDate = fromDate; }
        public OffsetDateTime getToDate() { return toDate; }
        public void setToDate(OffsetDateTime toDate) { this.toDate = toDate; }
    }

    public static class FileDownloadInfo {
        private final byte[] content;
        private final String filename;
        private final String contentType;

        public FileDownloadInfo(byte[] content, String filename, String contentType) {
            this.content = content;
            this.filename = filename;
            this.contentType = contentType;
        }

        public byte[] getContent() { return content; }
        public String getFilename() { return filename; }
        public String getContentType() { return contentType; }
    }
}