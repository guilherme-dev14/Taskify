package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.dto.UserDto.UserSummaryDTO;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class TaskHistoryDTO {
    private Long id;
    private String fieldChanged;
    private String oldValue;
    private String newValue;
    private String description;
    private OffsetDateTime changedAt;
    private UserSummaryDTO changedBy;
}