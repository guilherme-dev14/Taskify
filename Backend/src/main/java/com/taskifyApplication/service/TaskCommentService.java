package com.taskifyApplication.service;

import com.taskifyApplication.dto.CommentDto.CommentResponseDTO;
import com.taskifyApplication.dto.CommentDto.CreateCommentDTO;
import com.taskifyApplication.dto.CommentDto.UpdateCommentDTO;
import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import com.taskifyApplication.model.Task;
import com.taskifyApplication.model.TaskComment;
import com.taskifyApplication.model.User;
import com.taskifyApplication.repository.TaskCommentRepository;
import com.taskifyApplication.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskCommentService {

    @Autowired
    private TaskCommentRepository taskCommentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ValidationService validationService;

    public CommentResponseDTO createComment(Long taskId, CreateCommentDTO createCommentDTO) {
        User currentUser = userService.getCurrentUser();
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        TaskComment comment = TaskComment.builder()
            .content(validationService.sanitizeHtml(createCommentDTO.getContent()))
            .task(task)
            .author(currentUser)
            .build();

        TaskComment savedComment = taskCommentRepository.save(comment);
        return convertToResponseDTO(savedComment, currentUser);
    }

    public List<CommentResponseDTO> getCommentsByTaskId(Long taskId) {
        User currentUser = userService.getCurrentUser();
        List<TaskComment> comments = taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
        return comments.stream()
            .map(comment -> convertToResponseDTO(comment, currentUser))
            .collect(Collectors.toList());
    }

    public Page<CommentResponseDTO> getCommentsByTaskId(Long taskId, Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        Page<TaskComment> comments = taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(taskId, pageable);
        return comments.map(comment -> convertToResponseDTO(comment, currentUser));
    }

    public CommentResponseDTO updateComment(Long commentId, UpdateCommentDTO updateCommentDTO) {
        User currentUser = userService.getCurrentUser();
        TaskComment comment = taskCommentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }

        comment.setContent(validationService.sanitizeHtml(updateCommentDTO.getContent()));
        TaskComment updatedComment = taskCommentRepository.save(comment);
        return convertToResponseDTO(updatedComment, currentUser);
    }

    public void deleteComment(Long commentId) {
        User currentUser = userService.getCurrentUser();
        TaskComment comment = taskCommentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        taskCommentRepository.delete(comment);
    }

    private CommentResponseDTO convertToResponseDTO(TaskComment comment, User currentUser) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // Author info
        UserSummaryDTO authorDTO = new UserSummaryDTO();
        authorDTO.setId(comment.getAuthor().getId());
        authorDTO.setFirstName(comment.getAuthor().getName());
        authorDTO.setEmail(comment.getAuthor().getEmail());
        dto.setAuthor(authorDTO);

        // Task info
        TaskSummaryDTO taskDTO = new TaskSummaryDTO();
        taskDTO.setId(comment.getTask().getId());
        taskDTO.setTitle(comment.getTask().getTitle());
        dto.setTask(taskDTO);

        // Permissions
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());
        dto.setCanEdit(isAuthor);
        dto.setCanDelete(isAuthor);
        dto.setIsEdited(!comment.getCreatedAt().equals(comment.getUpdatedAt()));

        return dto;
    }
}
