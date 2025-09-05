package com.taskifyApplication.dto.analytics;

import java.util.List;

public class AnalyticsTrendsDto {
    private List<Integer> taskCompletion;
    private List<Integer> timeSpent;
    private List<Integer> productivity;
    private List<String> labels;

    // Constructors
    public AnalyticsTrendsDto() {}

    public AnalyticsTrendsDto(List<Integer> taskCompletion, List<Integer> timeSpent, 
                             List<Integer> productivity, List<String> labels) {
        this.taskCompletion = taskCompletion;
        this.timeSpent = timeSpent;
        this.productivity = productivity;
        this.labels = labels;
    }

    // Getters and Setters
    public List<Integer> getTaskCompletion() { return taskCompletion; }
    public void setTaskCompletion(List<Integer> taskCompletion) { this.taskCompletion = taskCompletion; }

    public List<Integer> getTimeSpent() { return timeSpent; }
    public void setTimeSpent(List<Integer> timeSpent) { this.timeSpent = timeSpent; }

    public List<Integer> getProductivity() { return productivity; }
    public void setProductivity(List<Integer> productivity) { this.productivity = productivity; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
}