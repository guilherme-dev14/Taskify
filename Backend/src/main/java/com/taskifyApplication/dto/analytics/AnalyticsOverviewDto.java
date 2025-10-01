package com.taskifyApplication.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDto {
    private int totalTasks;
    private int completedTasks;
    private int totalTimeSpent;
    private double averageCompletionTime;
    private double productivityScore;
    private double teamEfficiency;

}