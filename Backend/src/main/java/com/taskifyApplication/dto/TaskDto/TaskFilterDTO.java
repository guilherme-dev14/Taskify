package com.taskifyApplication.dto.TaskDto;


import com.taskifyApplication.model.PriorityEnum;
import com.taskifyApplication.model.StatusTaskEnum;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskFilterDTO {
    private List<StatusTaskEnum> statuses;
    private List<PriorityEnum> priorities;
    private List<Long> categoryIds;
    private List<Long> assignedToIds;
    private Long workspaceId;
    private LocalDateTime dueDateFrom;
    private LocalDateTime dueDateTo;
    private Boolean isOverdue;
    private String searchText;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
    private Integer page = 0;
    private Integer size = 20;
}
