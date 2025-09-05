package com.taskifyApplication.dto.analytics;

import java.util.List;

public class DistributionDataDto {
    private TaskDistribution tasksByStatus;
    private TaskDistribution tasksByPriority;
    private TaskDistribution timeByCategory;

    // Constructors
    public DistributionDataDto() {}

    public DistributionDataDto(TaskDistribution tasksByStatus, TaskDistribution tasksByPriority
                              ) {
        this.tasksByStatus = tasksByStatus;
        this.tasksByPriority = tasksByPriority;
    }

    // Getters and Setters
    public TaskDistribution getTasksByStatus() { return tasksByStatus; }
    public void setTasksByStatus(TaskDistribution tasksByStatus) { this.tasksByStatus = tasksByStatus; }

    public TaskDistribution getTasksByPriority() { return tasksByPriority; }
    public void setTasksByPriority(TaskDistribution tasksByPriority) { this.tasksByPriority = tasksByPriority; }

    public TaskDistribution getTimeByCategory() { return timeByCategory; }
    public void setTimeByCategory(TaskDistribution timeByCategory) { this.timeByCategory = timeByCategory; }

    // Inner class
    public static class TaskDistribution {
        private List<String> labels;
        private List<Integer> data;
        private List<String> colors;

        public TaskDistribution() {}

        public TaskDistribution(List<String> labels, List<Integer> data, List<String> colors) {
            this.labels = labels;
            this.data = data;
            this.colors = colors;
        }

        public List<String> getLabels() { return labels; }
        public void setLabels(List<String> labels) { this.labels = labels; }

        public List<Integer> getData() { return data; }
        public void setData(List<Integer> data) { this.data = data; }

        public List<String> getColors() { return colors; }
        public void setColors(List<String> colors) { this.colors = colors; }
    }
}