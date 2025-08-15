package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskSummaryDTO {
    private Long id;
    private String title;
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private String assignedToName;
    private String categoryName;
    private Boolean isOverdue;
}
