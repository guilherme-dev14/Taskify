package com.taskifyApplication.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DistributionDataDto {
    private TaskDistribution tasksByStatus;
    private TaskDistribution tasksByPriority;
    private TaskDistribution timeByCategory;

    public DistributionDataDto(TaskDistribution tasksByStatus, TaskDistribution tasksByPriority
                              ) {
        this.tasksByStatus = tasksByStatus;
        this.tasksByPriority = tasksByPriority;
    }

    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskDistribution {
        private List<String> labels;
        private List<Integer> data;
        private List<String> colors;
    }
}