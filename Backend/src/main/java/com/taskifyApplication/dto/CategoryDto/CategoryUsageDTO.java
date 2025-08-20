package com.taskifyApplication.dto.CategoryDto;


import lombok.Data;

@Data
public class CategoryUsageDTO {
    private CategoryResponseDTO category;
    private Integer taskCount;
    private Integer completedTasks;
    private Integer overdueTasks;
    private Double completionRate;
}
