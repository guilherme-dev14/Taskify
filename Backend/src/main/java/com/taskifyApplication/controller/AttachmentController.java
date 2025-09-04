package com.taskifyApplication.controller;

import com.taskifyApplication.model.Attachment;
import com.taskifyApplication.model.User;
import com.taskifyApplication.service.AttachmentService;
import com.taskifyApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private UserService userService;

    /**
     * Upload attachment
     */
    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "taskId", required = false) Long taskId,
            @RequestParam(value = "workspaceId", required = false) Long workspaceId,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        
        Attachment attachment = attachmentService.uploadAttachment(
            file, taskId, workspaceId, description, currentUser);
        
        return ResponseEntity.ok(attachment);
    }

    /**
     * Upload new version of attachment
     */
    @PostMapping("/{attachmentId}/versions")
    public ResponseEntity<Attachment> uploadNewVersion(
            @PathVariable Long attachmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changelog", required = false) String changelog,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        
        Attachment newVersion = attachmentService.uploadNewVersion(
            attachmentId, file, changelog, currentUser);
        
        return ResponseEntity.ok(newVersion);
    }

    /**
     * Get attachments with filtering
     */
    @GetMapping
    public ResponseEntity<Page<Attachment>> getAttachments(
            @RequestParam(value = "taskId", required = false) Long taskId,
            @RequestParam(value = "workspaceId", required = false) Long workspaceId,
            @RequestParam(value = "mimeType", required = false) String mimeType,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "uploadedAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        AttachmentService.AttachmentFilters filters = new AttachmentService.AttachmentFilters();
        filters.setTaskId(taskId);
        filters.setMimeType(mimeType);
        
        if (fromDate != null && !fromDate.isBlank()) {
            filters.setFromDate(OffsetDateTime.parse(fromDate, DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
        if (toDate != null && !toDate.isBlank()) {
            filters.setToDate(OffsetDateTime.parse(toDate, DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Attachment> attachments = attachmentService.getAttachments(filters, pageable);
        return ResponseEntity.ok(attachments);
    }

    /**
     * Get specific attachment
     */
    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachment(id);
        return ResponseEntity.ok(attachment);
    }

    /**
     * Get attachment versions
     */
    @GetMapping("/{id}/versions")
    public ResponseEntity<List<Attachment>> getAttachmentVersions(@PathVariable Long id) {
        List<Attachment> versions = attachmentService.getAttachmentVersions(id);
        return ResponseEntity.ok(versions);
    }

    /**
     * Download attachment
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadAttachment(@PathVariable Long id) {
        AttachmentService.FileDownloadInfo downloadInfo = attachmentService.getFileForDownload(id);
        
        ByteArrayResource resource = new ByteArrayResource(downloadInfo.getContent());
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(downloadInfo.getContentType()))
            .contentLength(downloadInfo.getContent().length)
            .header(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + downloadInfo.getFilename() + "\"")
            .body(resource);
    }

    /**
     * Get attachment preview (for images and supported formats)
     */
    @GetMapping("/{id}/preview")
    public ResponseEntity<ByteArrayResource> previewAttachment(@PathVariable Long id) {
        AttachmentService.FileDownloadInfo downloadInfo = attachmentService.getFileForDownload(id);
        
        // Only allow preview for safe file types
        String contentType = downloadInfo.getContentType();
        if (!isPreviewableContentType(contentType)) {
            return ResponseEntity.badRequest().build();
        }
        
        ByteArrayResource resource = new ByteArrayResource(downloadInfo.getContent());
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CACHE_CONTROL, "max-age=3600") // Cache for 1 hour
            .body(resource);
    }

    /**
     * Get attachment thumbnail
     */
    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<ByteArrayResource> getThumbnail(
            @PathVariable Long id,
            @RequestParam(value = "size", defaultValue = "medium") String size) {
        
        Attachment attachment = attachmentService.getAttachment(id);
        
        if (attachment.getThumbnailUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            AttachmentService.FileDownloadInfo thumbnailInfo = 
                attachmentService.getFileForDownload(id); // This needs to be modified to handle thumbnails
            
            ByteArrayResource resource = new ByteArrayResource(thumbnailInfo.getContent());
            
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400") // Cache for 24 hours
                .body(resource);
                
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete attachment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        attachmentService.deleteAttachment(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser(Authentication authentication) {
        return userService.getUserFromAuthentication(authentication);
    }

    private boolean isPreviewableContentType(String contentType) {
        if (contentType == null) return false;
        
        return contentType.startsWith("image/") || 
               contentType.equals("application/pdf") ||
               contentType.startsWith("text/") ||
               contentType.equals("application/json");
    }
}