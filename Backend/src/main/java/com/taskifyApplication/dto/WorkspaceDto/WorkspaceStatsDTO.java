package com.taskifyApplication.dto.WorkspaceDto;


import com.taskifyApplication.dto.CategoryDto.CategoryStatsDTO;
import com.taskifyApplication.dto.TaskDto.TaskStatsDTO;
import lombok.Data;

@Data
public class WorkspaceStatsDTO {
    private Long workspaceId;
    private String workspaceName;
    private Integer totalMembers;
    private TaskStatsDTO taskStats;
    private CategoryStatsDTO categoryStats;
    private MemberProductivityDTO memberProductivity;
}
