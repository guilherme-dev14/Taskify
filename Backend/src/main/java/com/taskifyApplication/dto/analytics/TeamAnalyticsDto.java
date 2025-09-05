package com.taskifyApplication.dto.analytics;

import java.util.List;

public class TeamAnalyticsDto {
    private List<TeamMemberAnalytics> members;
    private TeamStats teamStats;

    // Constructors
    public TeamAnalyticsDto() {}

    public TeamAnalyticsDto(List<TeamMemberAnalytics> members, TeamStats teamStats) {
        this.members = members;
        this.teamStats = teamStats;
    }

    // Getters and Setters
    public List<TeamMemberAnalytics> getMembers() { return members; }
    public void setMembers(List<TeamMemberAnalytics> members) { this.members = members; }

    public TeamStats getTeamStats() { return teamStats; }
    public void setTeamStats(TeamStats teamStats) { this.teamStats = teamStats; }

    // Inner classes
    public static class TeamMemberAnalytics {
        private Long id;
        private String name;
        private String avatar;
        private int completed;
        private int timeSpent;
        private double efficiency;
        private int tasksInProgress;
        private double averageTaskTime;

        public TeamMemberAnalytics() {}

        public TeamMemberAnalytics(Long id, String name, String avatar, int completed, 
                                  int timeSpent, double efficiency, int tasksInProgress, 
                                  double averageTaskTime) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
            this.completed = completed;
            this.timeSpent = timeSpent;
            this.efficiency = efficiency;
            this.tasksInProgress = tasksInProgress;
            this.averageTaskTime = averageTaskTime;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public int getCompleted() { return completed; }
        public void setCompleted(int completed) { this.completed = completed; }

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }

        public double getEfficiency() { return efficiency; }
        public void setEfficiency(double efficiency) { this.efficiency = efficiency; }

        public int getTasksInProgress() { return tasksInProgress; }
        public void setTasksInProgress(int tasksInProgress) { this.tasksInProgress = tasksInProgress; }

        public double getAverageTaskTime() { return averageTaskTime; }
        public void setAverageTaskTime(double averageTaskTime) { this.averageTaskTime = averageTaskTime; }
    }

    public static class TeamStats {
        private int totalMembers;
        private int activeMembers;
        private double averageEfficiency;
        private int totalTasksCompleted;
        private int totalTimeSpent;

        public TeamStats() {}

        public TeamStats(int totalMembers, int activeMembers, double averageEfficiency, 
                        int totalTasksCompleted, int totalTimeSpent) {
            this.totalMembers = totalMembers;
            this.activeMembers = activeMembers;
            this.averageEfficiency = averageEfficiency;
            this.totalTasksCompleted = totalTasksCompleted;
            this.totalTimeSpent = totalTimeSpent;
        }

        public int getTotalMembers() { return totalMembers; }
        public void setTotalMembers(int totalMembers) { this.totalMembers = totalMembers; }

        public int getActiveMembers() { return activeMembers; }
        public void setActiveMembers(int activeMembers) { this.activeMembers = activeMembers; }

        public double getAverageEfficiency() { return averageEfficiency; }
        public void setAverageEfficiency(double averageEfficiency) { this.averageEfficiency = averageEfficiency; }

        public int getTotalTasksCompleted() { return totalTasksCompleted; }
        public void setTotalTasksCompleted(int totalTasksCompleted) { this.totalTasksCompleted = totalTasksCompleted; }

        public int getTotalTimeSpent() { return totalTimeSpent; }
        public void setTotalTimeSpent(int totalTimeSpent) { this.totalTimeSpent = totalTimeSpent; }
    }
}