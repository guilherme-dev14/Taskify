package com.taskifyApplication.service;

import com.taskifyApplication.exception.BadRequestException;
import com.taskifyApplication.exception.ForbiddenException;
import com.taskifyApplication.exception.InvalidFormatException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import com.taskifyApplication.model.*;
import com.taskifyApplication.repository.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private ValidationService validationService;

    @Autowired
    private UserService userService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private FileService fileService;

    public List<Attachment> getAttachmentsForTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with id: " + taskId);
        }
        return attachmentRepository.findByTaskId(taskId);
    }

    public Attachment uploadAttachment(MultipartFile file, Long taskId, Long workspaceId, String description) {
        validateFile(file);

        Task task = null;
        Workspace workspace;

        if (taskId != null) {
            task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            workspace = task.getWorkspace();
        } else if (workspaceId != null) {
            workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        } else {
            throw new InvalidFormatException("Either taskId or workspaceId must be provided");
        }

        User uploadedBy = userService.getCurrentUser();

        try {
            String fileUrl = fileService.uploadFile(file);

            Attachment attachment = Attachment.builder()
                    .filePath(fileUrl)
                    .filename(extractFileNameFromUrl(fileUrl))
                    .originalName(file.getOriginalFilename())
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
            throw new BadRequestException("Failed to upload file. Reason: " + e.getMessage());
        }
    }

    public void deleteAttachment(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + id));

       Task task = attachment.getTask();
        if (task != null) {
            boolean isMember = workspaceRepository.isUserMemberOfWorkspace(task.getWorkspace().getId(), username);
            if (!isMember) {
                throw new ForbiddenException("User does not have permission to delete this attachment.");
            }
        } else {
            boolean isMember = workspaceRepository.isUserMemberOfWorkspace(attachment.getWorkspace().getId(), username);
            if (!isMember) {
                throw new ForbiddenException("User does not have permission to delete this attachment.");
            }
        }


        String fileUrl = attachment.getFilePath();

        try {
            if (fileUrl != null && !fileUrl.isEmpty()) {
                fileService.deleteFile(fileUrl);
            }
        } catch (Exception e) {
            System.err.println("Could not delete file from GCS: " + e.getMessage());
        }

        attachmentRepository.delete(attachment);
    }

    private String extractFileNameFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
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
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFormatException("File is empty");
        }
        if (!validationService.isValidFilename(file.getOriginalFilename())) {
            throw new InvalidFormatException("Invalid filename");
        }
        if (!validationService.isValidFileSize(file.getSize())) {
            throw new InvalidFormatException("File size exceeds maximum limit");
        }
        if (!validationService.isValidFileType(file.getContentType())) {
            throw new InvalidFormatException("File type not allowed");
        }
        if (!isValidFileHeader(file)) {
            throw new InvalidFormatException("Invalid file format detected");
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
            return false;
        }
    }

    private boolean isValidImageHeader(byte[] bytes, String contentType) {
        if (bytes.length < 4) return false;

        return switch (Objects.requireNonNull(contentType).toLowerCase()) {
            case "image/jpeg", "image/jpg" -> bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8;
            case "image/png" -> bytes[0] == (byte) 0x89 && bytes[1] == 'P' &&
                    bytes[2] == 'N' && bytes[3] == 'G';
            case "image/gif" -> (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F');
            case "image/webp" -> bytes.length >= 12 &&
                    bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                    bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
            default -> false;
        };
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

    @Setter
    @Getter
    public static class AttachmentFilters {
        private Long taskId;
        private String mimeType;
        private OffsetDateTime fromDate;
        private OffsetDateTime toDate;
    }

    public record FileDownloadInfo(byte[] content, String filename, String contentType) {}
}