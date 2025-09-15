package com.taskifyApplication.dto.CommentDto;


import com.taskifyApplication.dto.TaskDto.TaskSummaryDTO;
import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class CommentResponseDTO {
    private Long id;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private UserSummaryDTO author;
    private TaskSummaryDTO task;

    private Boolean isEdited;
    private Boolean canEdit;
    private Boolean canDelete;
}
