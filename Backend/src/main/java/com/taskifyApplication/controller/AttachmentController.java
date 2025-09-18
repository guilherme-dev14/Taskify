// taskifyApplication/controller/AttachmentController.java

package com.taskifyApplication.controller;

import com.taskifyApplication.model.Attachment;
import com.taskifyApplication.model.User;
import com.taskifyApplication.service.AttachmentService;
import com.taskifyApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private UserService userService;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "taskId", required = false) Long taskId,
            @RequestParam(value = "workspaceId", required = false) Long workspaceId,
            @RequestParam(value = "description", required = false) String description) {

        Attachment attachment = attachmentService.uploadAttachment(
                file, taskId, workspaceId, description);

        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadAttachment(@PathVariable Long id) {
        AttachmentService.FileDownloadInfo downloadInfo = attachmentService.getFileForDownload(id);
        ByteArrayResource resource = new ByteArrayResource(downloadInfo.content());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(downloadInfo.contentType()))
                .contentLength(downloadInfo.content().length)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        String.format("attachment; filename=\"%s\"", downloadInfo.filename()))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id ) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }

}