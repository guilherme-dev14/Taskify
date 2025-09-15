// taskifyApplication/service/AttachmentService.java

package com.taskifyApplication.service;

import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private ValidationService validationService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

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
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

            Attachment attachment = Attachment.builder()
                    .data(file.getBytes())
                    .filename(uniqueFilename)
                    .originalName(originalFilename)
                    .mimeType(file.getContentType())
                    .size(file.getSize())
                    .uploadedBy(uploadedBy)
                    .task(task)
                    .workspace(workspace)
                    .description(description)
                    .version(1)
                    .isLatestVersion(true)
                    .build();

            return attachmentRepository.save(attachment);

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes", e);
        }
    }

    public Attachment uploadNewVersion(Long attachmentId, MultipartFile file,
                                       String changelog, User uploadedBy) {
        Attachment parentAttachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        validateFile(file);

        try {
            parentAttachment.setIsLatestVersion(false);
            attachmentRepository.save(parentAttachment);

            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

            Attachment newVersion = Attachment.builder()
                    .data(file.getBytes())
                    .filename(uniqueFilename)
                    .originalName(originalFilename)
                    .mimeType(file.getContentType())
                    .size(file.getSize())
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

    public Page<Attachment> getAttachments(AttachmentFilters filters, Pageable pageable) {
        return attachmentRepository.findWithFilters(
                filters.getTaskId(),
                filters.getMimeType(),
                filters.getFromDate(),
                filters.getToDate(),
                pageable
        );
    }

    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    public List<Attachment> getAttachmentVersions(Long attachmentId) {
        Attachment attachment = getAttachment(attachmentId);
        Attachment parentAttachment = attachment.getParentAttachment() != null ?
                attachment.getParentAttachment() : attachment;
        return attachmentRepository.findByParentAttachmentOrderByVersionAsc(parentAttachment);
    }

    public void deleteAttachment(Long id, User user) {
        Attachment attachment = getAttachment(id);

        if (!canUserDeleteAttachment(attachment, user)) {
            throw new RuntimeException("Permission denied");
        }

        attachmentRepository.delete(attachment);
    }

    public FileDownloadInfo getFileForDownload(Long id) {
        Attachment attachment = getAttachment(id);

        return new FileDownloadInfo(
                attachment.getData(),
                attachment.getOriginalName(),
                attachment.getMimeType()
        );
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (!validationService.isValidFilename(file.getOriginalFilename())) {
            throw new RuntimeException("Invalid filename");
        }
        if (!validationService.isValidFileSize(file.getSize())) {
            throw new RuntimeException("File size exceeds maximum limit");
        }
        if (!validationService.isValidFileType(file.getContentType())) {
            throw new RuntimeException("File type not allowed");
        }
        if (!isValidFileHeader(file)) {
            throw new RuntimeException("Invalid file format detected");
        }
    }

    private boolean isValidFileHeader(MultipartFile file) {
        try (InputStream is = new BufferedInputStream(file.getInputStream())) {
            is.mark(1024);
            byte[] bytes = new byte[Math.min(1024, (int) file.getSize())];
            is.read(bytes);
            is.reset();

            String contentType = file.getContentType();
            if (contentType == null) return false;

            if (contentType.startsWith("image/")) {
                return isValidImageHeader(bytes, contentType);
            } else if (contentType.equalsIgnoreCase("application/pdf")) {
                return bytes.length >= 4 &&
                        bytes[0] == '%' && bytes[1] == 'P' &&
                        bytes[2] == 'D' && bytes[3] == 'F';
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean isValidImageHeader(byte[] bytes, String contentType) {
        if (bytes.length < 4) return false;

        switch (contentType.toLowerCase()) {
            case "image/jpeg":
            case "image/jpg":
                return bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8;
            case "image/png":
                return bytes[0] == (byte) 0x89 && bytes[1] == 'P' &&
                        bytes[2] == 'N' && bytes[3] == 'G';
            case "image/gif":
                return (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F');
            case "image/webp":
                return bytes.length >= 12 &&
                        bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                        bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
            default:
                return false;
        }
    }

    private boolean canUserDeleteAttachment(Attachment attachment, User user) {
        if (attachment.getUploadedBy().equals(user)) {
            return true;
        }
        Workspace workspace = attachment.getWorkspace();
        if (workspace != null) {
            RoleEnum userRole = workspace.getUserRole(user);
            return userRole == RoleEnum.ADMIN || userRole == RoleEnum.OWNER;
        }
        return false;
    }

    public static class AttachmentFilters {
        private Long taskId;
        private String mimeType;
        private OffsetDateTime fromDate;
        private OffsetDateTime toDate;

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