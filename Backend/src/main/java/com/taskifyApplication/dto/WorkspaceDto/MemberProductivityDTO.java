package com.taskifyApplication.dto.WorkspaceDto;


import lombok.Data;
import java.util.List;

@Data
public class MemberProductivityDTO {
    private List<UserProductivityDTO> topPerformers;
    private Double averageTasksPerMember;
    private Double averageCompletionRate;
}
