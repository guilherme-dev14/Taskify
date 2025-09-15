package com.taskifyApplication.dto.analytics;

public class ProductivityMetricsDto {
    private int todayCompleted;
    private int todayTarget;
    private int weeklyStreak;
    private double focusTime; // hours
    private double efficiency; // percentage
    private double weeklyGoalProgress; // percentage
    private DailyProgressDto dailyProgress;
    private WeeklyStatsDto weeklyStats;

    // Constructors
    public ProductivityMetricsDto() {}

    public ProductivityMetricsDto(int todayCompleted, int todayTarget, int weeklyStreak, 
                                 double focusTime, double efficiency, double weeklyGoalProgress,
                                 DailyProgressDto dailyProgress, WeeklyStatsDto weeklyStats) {
        this.todayCompleted = todayCompleted;
        this.todayTarget = todayTarget;
        this.weeklyStreak = weeklyStreak;
        this.focusTime = focusTime;
        this.efficiency = efficiency;
        this.weeklyGoalProgress = weeklyGoalProgress;
        this.dailyProgress = dailyProgress;
        this.weeklyStats = weeklyStats;
    }

    // Getters and Setters
    public int getTodayCompleted() { return todayCompleted; }
    public void setTodayCompleted(int todayCompleted) { this.todayCompleted = todayCompleted; }

    public int getTodayTarget() { return todayTarget; }
    public void setTodayTarget(int todayTarget) { this.todayTarget = todayTarget; }

    public int getWeeklyStreak() { return weeklyStreak; }
    public void setWeeklyStreak(int weeklyStreak) { this.weeklyStreak = weeklyStreak; }

    public double getFocusTime() { return focusTime; }
    public void setFocusTime(double focusTime) { this.focusTime = focusTime; }

    public double getEfficiency() { return efficiency; }
    public void setEfficiency(double efficiency) { this.efficiency = efficiency; }

    public double getWeeklyGoalProgress() { return weeklyGoalProgress; }
    public void setWeeklyGoalProgress(double weeklyGoalProgress) { this.weeklyGoalProgress = weeklyGoalProgress; }

    public DailyProgressDto getDailyProgress() { return dailyProgress; }
    public void setDailyProgress(DailyProgressDto dailyProgress) { this.dailyProgress = dailyProgress; }

    public WeeklyStatsDto getWeeklyStats() { return weeklyStats; }
    public void setWeeklyStats(WeeklyStatsDto weeklyStats) { this.weeklyStats = weeklyStats; }

    // Inner classes
    public static class DailyProgressDto {
        private int completed;
        private int target;
        private double percentage;

        public DailyProgressDto() {}

        public DailyProgressDto(int completed, int target, double percentage) {
            this.completed = completed;
            this.target = target;
            this.percentage = percentage;
        }

        public int getCompleted() { return completed; }
        public void setCompleted(int completed) { this.completed = completed; }

        public int getTarget() { return target; }
        public void setTarget(int target) { this.target = target; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class WeeklyStatsDto {
        private int tasksCompleted;
        private double totalFocusTime;
        private double averageTaskTime;
        private double productivityScore;

        public WeeklyStatsDto() {}

        public WeeklyStatsDto(int tasksCompleted, double totalFocusTime, 
                            double averageTaskTime, double productivityScore) {
            this.tasksCompleted = tasksCompleted;
            this.totalFocusTime = totalFocusTime;
            this.averageTaskTime = averageTaskTime;
            this.productivityScore = productivityScore;
        }

        public int getTasksCompleted() { return tasksCompleted; }
        public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }

        public double getTotalFocusTime() { return totalFocusTime; }
        public void setTotalFocusTime(double totalFocusTime) { this.totalFocusTime = totalFocusTime; }

        public double getAverageTaskTime() { return averageTaskTime; }
        public void setAverageTaskTime(double averageTaskTime) { this.averageTaskTime = averageTaskTime; }

        public double getProductivityScore() { return productivityScore; }
        public void setProductivityScore(double productivityScore) { this.productivityScore = productivityScore; }
    }
}