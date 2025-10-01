package com.taskifyApplication.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductivityMetricsDto {
    private int todayCompleted;
    private int todayTarget;
    private int weeklyStreak;
    private double focusTime;
    private double efficiency;
    private double weeklyGoalProgress;
    private DailyProgressDto dailyProgress;
    private WeeklyStatsDto weeklyStats;

    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyProgressDto {
        private int completed;
        private int target;
        private double percentage;
    }

    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStatsDto {
        private int tasksCompleted;
        private double totalFocusTime;
        private double averageTaskTime;
        private double productivityScore;
    }
}