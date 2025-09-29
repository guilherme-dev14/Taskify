package com.taskifyApplication.controller;

import com.taskifyApplication.dto.AttachmentDto.AttachmentResponseDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.Attachment;
import com.taskifyApplication.service.AttachmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List; // Importar List
import java.util.stream.Collectors; // Importar Collectors

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentResponseDTO>> getAttachmentsForTask(@PathVariable Long taskId) {
        List<Attachment> attachments = attachmentService.getAttachmentsForTask(taskId);

        List<AttachmentResponseDTO> response = attachments.stream().map(attachment -> new AttachmentResponseDTO(
                attachment.getId(),
                attachment.getOriginalName(),
                attachment.getFilePath(),
                attachment.getMimeType(),
                attachment.getSize(),
                attachment.getUploadedAt(),
                attachment.getDescription(),
                new UserSummaryDTO(attachment.getUploadedBy()),
                attachment.getVersion()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping(path = "/tasks/{taskId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // <-- ADICIONE AQUI
    public ResponseEntity<AttachmentResponseDTO> uploadAttachmentForTask(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {

        Attachment attachment = attachmentService.uploadAttachment(file, taskId, null, description);

        AttachmentResponseDTO response = new AttachmentResponseDTO(
                attachment.getId(),
                attachment.getOriginalName(),
                attachment.getFilePath(),
                attachment.getMimeType(),
                attachment.getSize(),
                attachment.getUploadedAt(),
                attachment.getDescription(),
                new UserSummaryDTO(attachment.getUploadedBy()),
                attachment.getVersion()
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}