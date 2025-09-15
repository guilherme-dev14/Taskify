package com.taskifyApplication.dto.analytics;

public class AnalyticsOverviewDto {
    private int totalTasks;
    private int completedTasks;
    private int totalTimeSpent; // minutes
    private double averageCompletionTime; // days
    private double productivityScore;
    private double teamEfficiency;

    // Constructors
    public AnalyticsOverviewDto() {}

    public AnalyticsOverviewDto(int totalTasks, int completedTasks, int totalTimeSpent, 
                               double averageCompletionTime, double productivityScore, double teamEfficiency) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.totalTimeSpent = totalTimeSpent;
        this.averageCompletionTime = averageCompletionTime;
        this.productivityScore = productivityScore;
        this.teamEfficiency = teamEfficiency;
    }

    // Getters and Setters
    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getTotalTimeSpent() { return totalTimeSpent; }
    public void setTotalTimeSpent(int totalTimeSpent) { this.totalTimeSpent = totalTimeSpent; }

    public double getAverageCompletionTime() { return averageCompletionTime; }
    public void setAverageCompletionTime(double averageCompletionTime) { this.averageCompletionTime = averageCompletionTime; }

    public double getProductivityScore() { return productivityScore; }
    public void setProductivityScore(double productivityScore) { this.productivityScore = productivityScore; }

    public double getTeamEfficiency() { return teamEfficiency; }
    public void setTeamEfficiency(double teamEfficiency) { this.teamEfficiency = teamEfficiency; }
}