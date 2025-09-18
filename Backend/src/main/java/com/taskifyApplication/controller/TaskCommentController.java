package com.taskifyApplication.controller;

import com.taskifyApplication.dto.CommentDto.CommentResponseDTO;
import com.taskifyApplication.dto.CommentDto.CreateCommentDTO;
import com.taskifyApplication.dto.CommentDto.UpdateCommentDTO;
import com.taskifyApplication.service.TaskCommentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
@CrossOrigin(origins = "http://localhost:5173")
@SecurityRequirement(name = "bearerAuth")
public class TaskCommentController {

    @Autowired
    private TaskCommentService taskCommentService;

    @PostMapping
    public ResponseEntity<CommentResponseDTO> createComment(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateCommentDTO createCommentDTO) {
            CommentResponseDTO comment = taskCommentService.createComment(taskId, createCommentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);

    }

    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long taskId) {
            List<CommentResponseDTO> comments = taskCommentService.getCommentsByTaskId(taskId);
            return ResponseEntity.ok(comments);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<CommentResponseDTO>> getCommentsPaginated(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<CommentResponseDTO> comments = taskCommentService.getCommentsByTaskId(taskId, pageable);
            return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentDTO updateCommentDTO) {
            CommentResponseDTO comment = taskCommentService.updateComment(commentId, updateCommentDTO);
            return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long taskId,
            @PathVariable Long commentId) {
            taskCommentService.deleteComment(commentId);
            return ResponseEntity.noContent().build();
    }
}