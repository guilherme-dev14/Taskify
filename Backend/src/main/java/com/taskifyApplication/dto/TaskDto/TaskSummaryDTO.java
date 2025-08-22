package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskSummaryDTO {
    private Long id;
    private String title;
    private StatusTaskEnum status;
    private PriorityEnum priority;
    private LocalDateTime dueDate;
    private String assignedToName;
    private List<String> categoryNames;
}
