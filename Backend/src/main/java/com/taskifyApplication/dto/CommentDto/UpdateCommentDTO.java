package com.taskifyApplication.dto.CommentDto;


import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UpdateCommentDTO {
    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Content must not exceed 1000 characters")
    private String content;
}